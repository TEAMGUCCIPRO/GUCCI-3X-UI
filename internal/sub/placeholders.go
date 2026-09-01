package sub

import (
	"errors"
	"net/url"
	"strings"

	"gorm.io/gorm"

	"github.com/mhsanaei/3x-ui/v3/internal/database"
	"github.com/mhsanaei/3x-ui/v3/internal/database/model"
	"github.com/mhsanaei/3x-ui/v3/internal/logger"
)

type subPlaceholderData struct {
	SubID   string
	Context remarkContext
	HasCtx  bool
	Escape  bool
}

type renderedSubMetadata struct {
	Title      string
	SupportURL string
	ProfileURL string
	Announce   string
}

func renderSubPlaceholders(value string, data subPlaceholderData) string {
	if value == "" || !strings.Contains(value, "{") {
		return value
	}

	ctx := data.Context
	if !data.HasCtx {
		ctx = remarkContext{
			client: model.Client{
				SubID: data.SubID,
			},
		}
	}
	if ctx.client.SubID == "" {
		ctx.client.SubID = data.SubID
	}
	return strings.TrimSpace(expandSubMetadataVars(value, ctx, data.Escape))
}

var subMetadataTokens = map[string]bool{
	"EMAIL":              true,
	"ID":                 true,
	"SHORT_ID":           true,
	"TELEGRAM_ID":        true,
	"SUB_ID":             true,
	"STATUS_EMOJI":       true,
	"TRAFFIC_LEFT":       true,
	"TRAFFIC_TOTAL":      true,
	"TRAFFIC_USED":       true,
	"TIME_LEFT":          true,
	"DAYS_LEFT":          true,
	"EXPIRE_DATE":        true,
	"JALALI_EXPIRE_DATE": true,
}

func expandSubMetadataVars(template string, ctx remarkContext, escape bool) string {
	return remarkVarRe.ReplaceAllStringFunc(template, func(match string) string {
		token := match[2 : len(match)-2]
		if !subMetadataTokens[token] {
			return match
		}
		value := remarkVarValue(token, ctx)
		if escape {
			return url.QueryEscape(value)
		}
		return value
	})
}

func subMetadataUsesPlaceholders(values ...string) bool {
	for _, value := range values {
		if strings.Contains(value, "{") {
			return true
		}
	}
	return false
}

func (a *SUBController) metadataForSubRequest(getSubReq func() *SubService, subID string, fallbackProfileURL string) renderedSubMetadata {
	var context remarkContext
	var hasContext bool
	// Always load the subscriber so the Happ Profile-Title can show that
	// user's status, email, remaining traffic and remaining time.
	if getSubReq != nil {
		subReq := getSubReq()
		if subReq != nil {
			var err error
			context, hasContext, err = subReq.subscriptionTemplateContextBySubID(subID)
			if err != nil {
				logger.Warning("sub: load template contexts for subscription metadata:", err)
			}
		}
	}
	profileURL := a.subProfileUrl
	if profileURL == "" {
		profileURL = fallbackProfileURL
	} else {
		profileURL = renderSubPlaceholders(profileURL, subPlaceholderData{SubID: subID, Context: context, HasCtx: hasContext, Escape: true})
	}
	data := subPlaceholderData{SubID: subID, Context: context, HasCtx: hasContext}
	email := ""
	if hasContext {
		email = context.client.Email
	}
	return renderedSubMetadata{
		Title:      gucciProfileTitle(email, subID, context.stats),
		SupportURL: renderSubPlaceholders(a.subSupportUrl, subPlaceholderData{SubID: subID, Context: context, HasCtx: hasContext, Escape: true}),
		ProfileURL: profileURL,
		Announce:   gucciAnnounce(renderSubPlaceholders(a.subAnnounce, data)),
	}
}

func (s *SubService) subscriptionTemplateContextBySubID(subID string) (remarkContext, bool, error) {
	if subID == "" {
		return remarkContext{}, false, nil
	}
	var rec model.ClientRecord
	err := database.GetDB().Where("sub_id = ?", subID).Order("id ASC").First(&rec).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return remarkContext{}, false, nil
	}
	if err != nil {
		return remarkContext{}, false, err
	}
	client := *rec.ToClient()

	inbounds, _ := s.getInboundsBySubId(subID)
	var emails []string
	var hasLiveClient bool
	var hasEnabledClient bool
	// Live inbound clients are the source of truth for the enable flag: the
	// client_records row can lag behind a panel disable, which used to keep a
	// green ✅ on the subscription profile title while every config name had
	// already flipped to ❌.
	for _, inbound := range inbounds {
		for _, c := range s.matchingClients(inbound, subID) {
			emails = append(emails, c.Email)
			hasLiveClient = true
			if c.Enable {
				hasEnabledClient = true
			}
		}
	}
	if client.Email != "" {
		emails = append(emails, client.Email)
	}
	// No live inbound client visible (external-only subscription, inbound not
	// loaded): trust the stored record so an ACTIVE user keeps the green check
	// and only a real disable/expiry flips the subscription title to the cross.
	if !hasLiveClient && client.Enable {
		hasEnabledClient = true
	}
	traffic, _ := s.AggregateTrafficByEmails(emails)
	traffic.Enable = hasEnabledClient
	if traffic.ExpiryTime == 0 {
		traffic.ExpiryTime = client.ExpiryTime
	}
	if traffic.Total == 0 {
		traffic.Total = client.TotalGB
	}
	return remarkContext{client: client, stats: traffic}, true, nil
}

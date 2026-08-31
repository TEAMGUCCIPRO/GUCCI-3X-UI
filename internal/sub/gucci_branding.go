package sub

import (
	"fmt"
	"strings"

	"github.com/mhsanaei/3x-ui/v3/internal/util/common"
	"github.com/mhsanaei/3x-ui/v3/internal/xray"
)

const gucciDummyHostPort = "127.0.0.1:1"
const gucciDummyUUID = "00000000-0000-0000-0000-000000000000"

// EnableSubscriptionBody marks this request as a client-app import (raw /json
// /clash) and locks the per-config remark template so host/inbound names cannot
// leak into Happ / v2rayNG.
func (s *SubService) EnableSubscriptionBody() {
	s.subscriptionBody = true
	s.remarkTemplate = gucciConfigRemarkTemplate
}

func firstNonEmptyEmail(emails []string, fallback string) string {
	for _, e := range emails {
		if e = strings.TrimSpace(e); e != "" {
			return e
		}
	}
	return fallback
}

func formatTrafficSpaced(bytes int64) string {
	s := common.FormatTraffic(bytes)
	i := len(s)
	for i > 0 {
		c := s[i-1]
		if (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') {
			i--
			continue
		}
		break
	}
	if i > 0 && i < len(s) {
		return strings.TrimSpace(s[:i]) + " " + s[i:]
	}
	return s
}

func gucciTrafficLeft(st xray.ClientTraffic) string {
	if st.Total <= 0 {
		return unlimitedMark
	}
	return formatTrafficSpaced(max64(st.Total-(st.Up+st.Down), 0))
}

// gucciInfoRemark is the subscription profile title and the second dummy config:
// ✅ 👤 email | 📊 10.09 GB | 🕔 27 روز
func gucciInfoRemark(email string, st xray.ClientTraffic) string {
	if email == "" {
		email = "-"
	}
	return fmt.Sprintf("%s 👤 %s | 📊 %s | 🕔 %s", statusEmoji(st), email, gucciTrafficLeft(st), timeLeftLabel(st.ExpiryTime))
}

// gucciConfigRemark is the name of every real config: ✅ 👤 email / ❌ 👤 email
func gucciConfigRemark(email string, st xray.ClientTraffic) string {
	if email == "" {
		email = "-"
	}
	return fmt.Sprintf("%s 👤 %s", statusEmoji(st), email)
}

func (s *SubService) statsForGucci(email string, fallback xray.ClientTraffic) xray.ClientTraffic {
	if email != "" && s != nil && s.statsByEmail != nil {
		if got, ok := s.statsByEmail[email]; ok {
			if got.Email == "" {
				got.Email = email
			}
			return got
		}
	}
	st := fallback
	st.Email = email
	return st
}

func isGucciDummyLink(link string) bool {
	l := strings.ToLower(link)
	return strings.Contains(l, "@127.0.0.1:1") || strings.Contains(l, `"add": "127.0.0.1"`) || strings.Contains(l, `"add":"127.0.0.1"`)
}

func isShareURIForRemark(link string) bool {
	l := strings.ToLower(strings.TrimSpace(link))
	for _, p := range []string{
		"vless://", "vmess://", "trojan://", "ss://", "ssr://",
		"hysteria2://", "hy2://", "hysteria://", "tuic://", "wireguard://",
	} {
		if strings.HasPrefix(l, p) {
			return true
		}
	}
	return false
}

func gucciDummyLinks(infoRemark string) []string {
	params := map[string]string{
		"encryption": "none",
		"security":   "none",
		"type":       "tcp",
	}
	base := "vless://" + gucciDummyUUID + "@" + gucciDummyHostPort
	return []string{
		buildLinkWithParams(base, params, gucciUpdateNoticeRemark),
		buildLinkWithParams(base, params, infoRemark),
	}
}

func gucciDummyClashProxies(infoRemark string) []map[string]any {
	dummy := func(name string) map[string]any {
		return map[string]any{
			"name":             name,
			"type":             "vless",
			"server":           "127.0.0.1",
			"port":             1,
			"uuid":             gucciDummyUUID,
			"network":          "tcp",
			"udp":              false,
			"tls":              false,
			"skip-cert-verify": true,
		}
	}
	return []map[string]any{
		dummy(gucciUpdateNoticeRemark),
		dummy(infoRemark),
	}
}

// applyGucciSubscriptionBody rewrites every real share-link remark to
// status+email, drops leftover 127.0.0.1:1 placeholders, then prepends the two
// non-working GUCCI dummies (update reminder, then full quota/time sample).
func (s *SubService) applyGucciSubscriptionBody(result, emails []string, subId string, traffic xray.ClientTraffic) []string {
	firstEmail := firstNonEmptyEmail(emails, subId)
	rewritten := make([]string, 0, len(result)+2)
	for i, group := range result {
		email := firstEmail
		if i < len(emails) && strings.TrimSpace(emails[i]) != "" {
			email = emails[i]
		}
		st := s.statsForGucci(email, traffic)
		remark := gucciConfigRemark(email, st)
		for _, line := range splitLinkLines(group) {
			if strings.TrimSpace(line) == "" || isGucciDummyLink(line) {
				continue
			}
			if isShareURIForRemark(line) {
				rewritten = append(rewritten, applyRemarkToLink(line, remark))
				continue
			}
			rewritten = append(rewritten, line)
		}
	}
	infoRemark := gucciInfoRemark(firstEmail, s.statsForGucci(firstEmail, traffic))
	return append(gucciDummyLinks(infoRemark), rewritten...)
}

func gucciProfileTitle(email, subID string, st xray.ClientTraffic) string {
	if email == "" {
		email = subID
	}
	return gucciInfoRemark(email, st)
}

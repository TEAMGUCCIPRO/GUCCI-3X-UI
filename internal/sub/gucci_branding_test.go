package sub

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/mhsanaei/3x-ui/v3/internal/database/model"
	"github.com/mhsanaei/3x-ui/v3/internal/xray"
)

func TestGucciInfoRemark_ActiveWithQuotaAndDays(t *testing.T) {
	expiry := time.Now().Add(27*24*time.Hour + 2*time.Hour).UnixMilli()
	st := xray.ClientTraffic{
		Enable:     true,
		Total:      20 * 1024 * 1024 * 1024,
		Up:         5 * 1024 * 1024 * 1024,
		Down:       5 * 1024 * 1024 * 1024,
		ExpiryTime: expiry,
	}
	got := gucciInfoRemark("Qm5V4Pp5", st)
	if !strings.HasPrefix(got, "✅ 👤 Qm5V4Pp5 | 📊 10.00 GB | 🕔 27 روز") {
		t.Fatalf("active info remark = %q", got)
	}
}

func TestGucciInfoRemark_InactiveUnlimited(t *testing.T) {
	got := gucciInfoRemark("Qm5V4Pp5", xray.ClientTraffic{Enable: false})
	want := "❌ 👤 Qm5V4Pp5 | 📊 ∞ | 🕔 ∞"
	if got != want {
		t.Fatalf("inactive info remark = %q, want %q", got, want)
	}
}

func TestGucciConfigRemark_StatusEmailOnly(t *testing.T) {
	if got := gucciConfigRemark("Qm5V4Pp5", xray.ClientTraffic{Enable: true}); got != "✅ 👤 Qm5V4Pp5" {
		t.Fatalf("active config remark = %q", got)
	}
	if got := gucciConfigRemark("Qm5V4Pp5", xray.ClientTraffic{Enable: false}); got != "❌ 👤 Qm5V4Pp5" {
		t.Fatalf("inactive config remark = %q", got)
	}
}

func TestApplyGucciSubscriptionBody_OrderAndRewritesHostNames(t *testing.T) {
	s := &SubService{}
	hostNamed := "vless://11111111-1111-1111-1111-111111111111@guc.example.com:2831?type=tcp&security=none#guc-germany2831"
	inboundNamed := "trojan://secret@guc.example.com:2832?type=tcp&security=none#guc-****2832"
	result := s.applyGucciSubscriptionBody(
		[]string{hostNamed, inboundNamed},
		[]string{"tdu4dxst60", "tdu4dxst60"},
		"tdu4dxst60",
		xray.ClientTraffic{Enable: true},
	)
	if len(result) != 4 {
		t.Fatalf("links = %d, want 4 (2 dummies + 2 real); got %#v", len(result), result)
	}
	if !strings.Contains(result[0], "@127.0.0.1:1") {
		t.Fatalf("first dummy must be 127.0.0.1:1: %s", result[0])
	}
	if got := linkFragment(t, result[0]); got != gucciUpdateNoticeRemark {
		t.Fatalf("first dummy remark = %q, want update notice", got)
	}
	if got := linkFragment(t, result[1]); got != "✅ 👤 tdu4dxst60 | 📊 ∞ | 🕔 ∞" {
		t.Fatalf("second dummy remark = %q", got)
	}
	for i, link := range result[2:] {
		if got := linkFragment(t, link); got != "✅ 👤 tdu4dxst60" {
			t.Fatalf("real config %d remark = %q, want status+email (host/inbound name must not leak)", i, got)
		}
		if strings.Contains(link, "guc-") && strings.Contains(link, "#guc") {
			t.Fatalf("host remark leaked into real config: %s", link)
		}
	}
}

func TestGetSubs_SubscriptionBodyUsesGucciNames(t *testing.T) {
	seedSubDB(t)
	ib := seedSubInbound(t, "s1", "guc-fra2831", 4431, 1, `{"network":"tcp","security":"none"}`)
	seedHost(t, &model.Host{
		InboundId: ib.Id, Address: "cdn.example.com", Port: 443,
		Remark: "guc-host2831", SortOrder: 1,
	})

	s := NewSubService("")
	s.EnableSubscriptionBody()
	links, emails, _, _, err := s.GetSubs("s1", "req.example.com")
	if err != nil {
		t.Fatalf("GetSubs: %v", err)
	}
	if len(emails) == 0 || emails[0] != "guc-fra2831@e" {
		t.Fatalf("emails = %v", emails)
	}
	flat := make([]string, 0, len(links)*2)
	for _, group := range links {
		flat = append(flat, splitLinkLines(group)...)
	}
	if len(flat) < 3 {
		t.Fatalf("flat links = %d, want at least 3; %#v", len(flat), flat)
	}
	if got := linkFragment(t, flat[0]); got != gucciUpdateNoticeRemark {
		t.Fatalf("first = %q", got)
	}
	if got := linkFragment(t, flat[1]); !strings.HasPrefix(got, "✅ 👤 guc-fra2831@e | 📊") {
		t.Fatalf("second = %q", got)
	}
	for _, link := range flat[2:] {
		if got := linkFragment(t, link); got != "✅ 👤 guc-fra2831@e" {
			t.Fatalf("real remark = %q from %s", got, link)
		}
		if strings.Contains(urlPathUnescapeOr(link), "guc-host2831") {
			t.Fatalf("host remark leaked: %s", link)
		}
	}
}

func TestSubsHTTP_ProfileTitleAndConfigRemarks(t *testing.T) {
	gin.SetMode(gin.TestMode)
	seedSubDB(t)
	seedSubInbound(t, "s1", "Qm5V4Pp5", 4431, 1, `{"network":"tcp","security":"none"}`)

	router := gin.New()
	NewSUBController(router.Group("/"),
		WithSUBTitle(gucciInfoRemarkTemplate),
		WithSUBRemarkTemplate(gucciConfigRemarkTemplate),
		WithSUBAnnounce("⚡️ 👑 🅖🅤🅒🅒🅘 🅣🅔🅐🅜 👑 ⚡️"),
		WithSUBEncryption(false),
	)

	req := httptest.NewRequest(http.MethodGet, "/sub/s1", nil)
	req.Host = "sub.example.com"
	req.Header.Set("User-Agent", "Happ/1.0")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d body=%s", w.Code, w.Body.String())
	}

	titleHdr := w.Header().Get("Profile-Title")
	if !strings.HasPrefix(titleHdr, "base64:") {
		t.Fatalf("Profile-Title = %q, want base64:", titleHdr)
	}
	decoded, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(titleHdr, "base64:"))
	if err != nil {
		t.Fatalf("decode Profile-Title: %v", err)
	}
	title := string(decoded)
	if title != "✅ 👤 Qm5V4Pp5@e | 📊 ∞ | 🕔 ∞" {
		t.Fatalf("Profile-Title decoded = %q", title)
	}
	if !strings.Contains(w.Header().Get("Content-Disposition"), url.PathEscape(title)) {
		t.Fatalf("Content-Disposition = %q, want filename from title", w.Header().Get("Content-Disposition"))
	}
	announce := w.Header().Get("Announce")
	if announce == "" {
		t.Fatal("missing Announce header")
	}

	body := w.Body.String()
	lines := strings.Split(strings.TrimSpace(body), "\n")
	if len(lines) < 3 {
		t.Fatalf("body lines = %d, body=%s", len(lines), body)
	}
	if got := linkFragment(t, lines[0]); got != gucciUpdateNoticeRemark {
		t.Fatalf("first config = %q", got)
	}
	if got := linkFragment(t, lines[1]); got != title {
		t.Fatalf("second config = %q, want same as profile title %q", got, title)
	}
	if got := linkFragment(t, lines[2]); got != "✅ 👤 Qm5V4Pp5@e" {
		t.Fatalf("real config = %q", got)
	}
}

func TestGetJsonAndClash_SubscriptionBodyUsesGucciNames(t *testing.T) {
	seedSubDB(t)
	ib := seedSubInbound(t, "s1", "guc-fra2831", 4431, 1, `{"network":"tcp","security":"none"}`)
	seedHost(t, &model.Host{
		InboundId: ib.Id, Address: "cdn.example.com", Port: 443,
		Remark: "guc-host2831", SortOrder: 1,
	})

	js := NewSubJsonService("", "", "", NewSubService(""))
	out, _, err := js.GetJson("s1", "req.example.com", true)
	if err != nil {
		t.Fatalf("GetJson: %v", err)
	}
	var docs []map[string]any
	if err := json.Unmarshal([]byte(out), &docs); err != nil {
		t.Fatalf("GetJson is not an array: %v\n%s", err, out)
	}
	if len(docs) != 3 {
		t.Fatalf("json docs = %d, want 3 (2 dummies + 1 real)", len(docs))
	}
	if docs[0]["remarks"] != gucciUpdateNoticeRemark {
		t.Fatalf("json first remark = %v", docs[0]["remarks"])
	}
	info, _ := docs[1]["remarks"].(string)
	if !strings.HasPrefix(info, "✅ 👤 guc-fra2831@e | 📊") {
		t.Fatalf("json second remark = %q", info)
	}
	if docs[2]["remarks"] != "✅ 👤 guc-fra2831@e" {
		t.Fatalf("json real remark = %v", docs[2]["remarks"])
	}
	if strings.Contains(out, "guc-host2831") {
		t.Fatalf("host remark leaked into JSON: %s", out)
	}

	yaml, _, err := NewSubClashService(false, "", NewSubService("")).GetClash("s1", "req.example.com")
	if err != nil {
		t.Fatalf("GetClash: %v", err)
	}
	if !strings.Contains(yaml, gucciUpdateNoticeRemark) {
		t.Fatalf("clash missing update dummy:\n%s", yaml)
	}
	if !strings.Contains(yaml, "✅ 👤 guc-fra2831@e | 📊") {
		t.Fatalf("clash missing info dummy:\n%s", yaml)
	}
	if !strings.Contains(yaml, "✅ 👤 guc-fra2831@e") {
		t.Fatalf("clash missing config name:\n%s", yaml)
	}
	if strings.Contains(yaml, "guc-host2831") {
		t.Fatalf("host remark leaked into Clash:\n%s", yaml)
	}
}

func linkFragment(t *testing.T, link string) string {
	t.Helper()
	i := strings.IndexByte(link, '#')
	if i < 0 {
		t.Fatalf("no fragment: %s", link)
	}
	raw, err := url.PathUnescape(link[i+1:])
	if err != nil {
		raw, err = url.QueryUnescape(link[i+1:])
	}
	if err != nil {
		t.Fatalf("unescape fragment: %s", link)
	}
	return raw
}

func urlPathUnescapeOr(s string) string {
	out, err := url.PathUnescape(s)
	if err != nil {
		return s
	}
	return out
}

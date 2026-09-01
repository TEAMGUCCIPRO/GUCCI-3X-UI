package sub

import (
	"strings"
	"testing"

	"github.com/mhsanaei/3x-ui/v3/internal/xray"
)

// The subscription link name carries no status mark: it is always
// "👤 email | 📊 traffic left | 🕔 time left", built from the live state of the
// current request (the config names keep their ✅ / ❌).
func TestProfileTitleHasNoStatusEmoji(t *testing.T) {
	cases := []struct {
		name  string
		stats xray.ClientTraffic
	}{
		{"active", xray.ClientTraffic{Email: "8lnydmnsm5", Enable: true}},
		{"disabled", xray.ClientTraffic{Email: "p0vdfx1u1y", Enable: false}},
		{"expired", xray.ClientTraffic{Email: "p0vdfx1u1y", Enable: true, ExpiryTime: 1}},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			s := &SubService{
				lastSubLoaded:  true,
				lastSubID:      "sub-1",
				lastSubEmails:  []string{tc.stats.Email},
				lastSubTraffic: tc.stats,
			}
			ctx, ok, err := s.subscriptionTemplateContextBySubID("sub-1")
			if err != nil || !ok {
				t.Fatalf("context lookup failed: ok=%v err=%v", ok, err)
			}
			title := gucciProfileTitle(ctx.client.Email, "sub-1", ctx.stats)
			if !strings.HasPrefix(title, "👤 ") {
				t.Fatalf("title %q must start with the user mark", title)
			}
			if strings.Contains(title, "✅") || strings.Contains(title, "❌") {
				t.Fatalf("title %q must not carry a status emoji", title)
			}
			if !strings.Contains(title, tc.stats.Email) ||
				!strings.Contains(title, "📊") || !strings.Contains(title, "🕔") {
				t.Fatalf("title %q missing email/traffic/time", title)
			}
		})
	}
}

func TestProfileTitleUnlimitedFormat(t *testing.T) {
	got := gucciProfileTitle("r9omvk492b", "sub-1", xray.ClientTraffic{Email: "r9omvk492b", Enable: true})
	want := "👤 r9omvk492b | 📊 ∞ | 🕔 ∞"
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

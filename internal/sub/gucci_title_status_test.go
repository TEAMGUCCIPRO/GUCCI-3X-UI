package sub

import (
	"strings"
	"testing"

	"github.com/mhsanaei/3x-ui/v3/internal/xray"
)

// The subscription link name must carry the same status emoji as the config
// names shipped in the same response: ✅ while the service is active, ❌ once it
// is disabled or expired.
func TestProfileTitleStatusMatchesConfigRemarks(t *testing.T) {
	cases := []struct {
		name  string
		stats xray.ClientTraffic
		want  string
	}{
		{"active", xray.ClientTraffic{Email: "8lnydmnsm5", Enable: true}, "✅"},
		{"disabled", xray.ClientTraffic{Email: "p0vdfx1u1y", Enable: false}, "❌"},
		{"expired", xray.ClientTraffic{Email: "p0vdfx1u1y", Enable: true, ExpiryTime: 1}, "❌"},
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
			config := gucciConfigRemark(ctx.client.Email, ctx.stats)
			if !strings.HasPrefix(title, tc.want) {
				t.Fatalf("title %q does not start with %q", title, tc.want)
			}
			if !strings.HasPrefix(config, tc.want) {
				t.Fatalf("config remark %q does not start with %q", config, tc.want)
			}
			if !strings.Contains(title, tc.stats.Email) {
				t.Fatalf("title %q missing email", title)
			}
		})
	}
}

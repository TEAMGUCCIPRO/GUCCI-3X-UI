package service

import "testing"

// BuildSubURIBase is the single source of truth for the scheme://host prefix
// shown both on the panel's Client Information page and on the subscription
// page. Without an explicit reverse-proxy subURI it must follow the panel's
// own request host so every deployment serves its own links.
func TestBuildSubURIBase(t *testing.T) {
	setupConflictDB(t)
	s := &SettingService{}

	set := func(subDomain, subURI string) {
		if err := s.saveSetting("subDomain", subDomain); err != nil {
			t.Fatalf("set subDomain: %v", err)
		}
		if err := s.saveSetting("subURI", subURI); err != nil {
			t.Fatalf("set subURI: %v", err)
		}
	}

	cases := []struct {
		name              string
		subDomain, subURI string
		host              string
		want              string
	}{
		{"request host is used", "", "", "panel.example.com", "https://panel.example.com"},
		{"request host keeps its port", "", "", "panel.example.com:8443", "https://panel.example.com:8443"},
		{"sub domain preferred over host", "sub.cdn.com", "", "panel.example.com", "https://sub.cdn.com"},
		{"explicit subURI wins", "", "https://proxy.example.com/sub/", "panel.example.com", "https://proxy.example.com"},
		{"stale owner host is ignored", "", "https://old.workers.dev:2096/sub/", "panel.example.com", "https://panel.example.com"},
		{"localhost falls back to http", "", "", "localhost:2096", "http://localhost:2096"},
		{"ipv6 host is bracketed", "", "", "::1", "http://[::1]"},
		{"empty host yields empty base", "", "", "", ""},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			set(c.subDomain, c.subURI)
			if got := s.BuildSubURIBase(c.host); got != c.want {
				t.Fatalf("BuildSubURIBase(%q) = %q, want %q", c.host, got, c.want)
			}
		})
	}
}

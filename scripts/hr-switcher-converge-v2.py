from pathlib import Path
import re

switcher_path = Path('src/components/HermesConnectAccountSwitcher.astro')
text = switcher_path.read_text()
original = text

old_prop = '  current: "repair" | "academy" | "ai" | "beauty" | "neutral";'
new_prop = '  current: "repair" | "academy" | "ai" | "beauty" | "hr" | "neutral";'
assert text.count(old_prop) == 1, 'unexpected current prop baseline'
text = text.replace(old_prop, new_prop, 1)

labels = {
    'en': 'HR Review',
    'ru': 'HR-проверка',
    'uk': 'HR-перевірка',
    'es': 'Revisión HR',
    'it': 'Revisione HR',
    'fr': 'Revue RH',
}
for locale, label in labels.items():
    pattern = rf'^(\s*{locale}: \{{[^\n]*?beauty: "Beauty",)( owned:)'
    text, count = re.subn(pattern, rf'\1 hr: "{label}",\2', text, flags=re.M)
    assert count == 2, f'unexpected {locale} copy baseline: {count}'

lines = text.splitlines(keepends=True)
ai_anchor_indexes = [i for i, line in enumerate(lines) if 'data-workspace-ai data-hc-workspace-link="ai" hidden>' in line]
assert len(ai_anchor_indexes) == 2, f'expected two AI account anchors, got {len(ai_anchor_indexes)}'
for index in reversed(ai_anchor_indexes):
    indent = lines[index][:len(lines[index]) - len(lines[index].lstrip())]
    inner = indent + '  '
    block = (
        f'{indent}<a class:list={{["hc-account-workspace", "hr", current === "hr" && "is-current"]}} href="/demos/hermes-connect/hr-admin.html" data-workspace-hr data-hc-workspace-link="hr" hidden>\n'
        f'{inner}<span class="hc-workspace-dot" aria-hidden="true"></span>\n'
        f'{inner}<span><strong data-hc-copy="hr">{{t.hr}}</strong><small data-hc-copy="internal">{{t.internal}}</small></span>\n'
        f'{inner}<em data-hc-copy={{current === "hr" ? "current" : "open"}}>{{current === "hr" ? t.current : t.open}}</em>\n'
        f'{indent}</a>\n'
    )
    lines.insert(index, block)
text = ''.join(lines)

path_needle = '      academy: "/services/hermes-connect/academy/dashboard/",\n      ai: "/services/hermes-connect/internal/ai-connect/",'
path_replace = '      academy: "/services/hermes-connect/academy/dashboard/",\n      hr: "/demos/hermes-connect/hr-admin.html",\n      ai: "/services/hermes-connect/internal/ai-connect/",'
assert text.count(path_needle) == 1, 'unexpected workspace path baseline'
text = text.replace(path_needle, path_replace, 1)

lookup_needle = '        const academyWorkspace = workspaces.find((item) => item?.key === "academy" && item?.available !== false);\n        const aiWorkspace = workspaces.find((item) => item?.key === "internal_ai" && item?.available !== false);'
lookup_replace = '        const academyWorkspace = workspaces.find((item) => item?.key === "academy" && item?.available !== false);\n        const hrWorkspace = workspaces.find((item) => item?.key === "hr" && item?.available !== false);\n        const aiWorkspace = workspaces.find((item) => item?.key === "internal_ai" && item?.available !== false);'
assert text.count(lookup_needle) == 1, 'unexpected workspace lookup baseline'
text = text.replace(lookup_needle, lookup_replace, 1)

ai_reveal = '        const ai = root.querySelector<HTMLElement>("[data-workspace-ai]");\n        if (aiWorkspace && ai) ai.hidden = false;'
hr_reveal = '''        const hr = root.querySelector<HTMLAnchorElement>("[data-workspace-hr]");
        if (hrWorkspace && hr) {
          if (hrWorkspace.href) hr.href = withLocale(hrWorkspace.href);
          hr.hidden = false;
        }

'''
assert text.count(ai_reveal) == 1, 'unexpected AI reveal baseline'
text = text.replace(ai_reveal, hr_reveal + ai_reveal, 1)

ai_css = '.hc-account-workspace.ai{--workspace-accent:var(--hermes-ai-product,#ff7a00)}'
hr_css = '.hc-account-workspace.hr{--workspace-accent:var(--hermes-obsidian,#11161f)}'
assert text.count(ai_css) == 1, 'unexpected AI CSS baseline'
text = text.replace(ai_css, ai_css + hr_css, 1)

assert text.count('data-workspace-ai') == original.count('data-workspace-ai'), 'AI workspace markup must remain unchanged'
assert text.count('item?.key === "internal_ai"') == original.count('item?.key === "internal_ai"'), 'AI authorization lookup must remain unchanged'
assert 'else if (current === "hr")' not in text, 'client route must never bypass backend HR authorization'
assert text.count('data-workspace-hr') == 3, 'expected two HR anchors plus one authorized lookup'
assert text.count('data-hc-workspace-link="hr"') == 2, 'expected HR links in panel and menu only'
switcher_path.write_text(text)

test_path = Path('scripts/hermes-connect-hr-design4-replay.test.mjs')
test = test_path.read_text()
read_marker = "const hrLib = await readFile(new URL('../functions/api/_lib/hr.mjs', import.meta.url), 'utf8');\n"
assert test.count(read_marker) == 1, 'unexpected replay test read baseline'
test = test.replace(read_marker, read_marker + "const switcher = await readFile(new URL('../src/components/HermesConnectAccountSwitcher.astro', import.meta.url), 'utf8');\n", 1)

console_marker = "\nconsole.log('Hermes Connect HR Design 4 replay + private SEO boundary contract: PASS');"
assertions = r'''
assert.match(switcher, /data-workspace-hr data-hc-workspace-link="hr" hidden/, 'shared account switcher must keep HR hidden by default');
assert.match(switcher, /item\?\.key === "hr" && item\?\.available !== false/, 'shared account switcher must consume backend-authorized HR workspace only');
assert.match(switcher, /if \(hrWorkspace && hr\) \{[\s\S]*?hr\.hidden = false;/, 'authorized backend HR workspace may reveal the HR link');
assert.doesNotMatch(switcher, /else if \(current === "hr"\)[\s\S]{0,180}?hidden = false/, 'current route must never bypass backend HR authorization');
assert.match(switcher, /hr:\s*"HR-проверка"/, 'Russian account portfolio must localize HR workspace copy');
assert.match(switcher, /hr:\s*"HR-перевірка"/, 'Ukrainian account portfolio must localize HR workspace copy');
'''
assert test.count(console_marker) == 1, 'unexpected replay test footer baseline'
test = test.replace(console_marker, '\n' + assertions.strip() + console_marker, 1)
test_path.write_text(test)

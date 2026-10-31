# Research Team Mode

**एक DSH एजेंट प्रीसेट जो एक सत्र को एक छोटी, समन्वित शोध टीम में बदलता है।**

**संस्करण 0.1.0** · **अद्यतन 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <a href="README.ar.md">العربية</a> · <strong>हिन्दी</strong></p>

---

## अवलोकन

Research Team Mode एक DSH एजेंट प्रीसेट है जो एकल चैट के बजाय एक टीम के रूप में एंड-टू-एंड शोध चलाने के लिए बनाया गया है। Lead काम की योजना बनाता है, टास्क बोर्ड रखता है, कार्ड वितरित करता है, परिणामों को एकीकृत करता है और उपयोगकर्ता से बात करता है। सात डिफ़ॉल्ट विशेषज्ञ सलाहकारी समीक्षा, साहित्य और साक्ष्य, डेटा अधिग्रहण, कोड, रन, स्वतंत्र समीक्षा और पेपर लेखन को कवर करते हैं।

यह मोड ऐसे शोध के लिए बना है जो कई दिनों या हफ़्तों तक चलता है, जिसमें साक्ष्य को ट्रेस किया जा सके और स्पष्ट भूमिका-सीमाओं का लाभ मिलता है। यह एक-बार के प्रश्नोत्तर वाला मोड नहीं है: Lead केवल वही भूमिकाएँ बनाता है जिनकी किसी काम को वास्तव में ज़रूरत होती है।

## एक नज़र में

| | |
| --- | --- |
| **डिफ़ॉल्ट भूमिकाएँ** | 7: advisor, researcher, data, builder, runner, reviewer, writer |
| **वर्कफ़्लो** | पहले टास्क बोर्ड: बनाएँ, claim करें, निष्पादित करें, रिपोर्ट करें, समीक्षा करें, उपयोगकर्ता की स्वीकृति |
| **पूर्णता** | `in_review` एजेंट का अंतिम पड़ाव है; कार्ड को केवल उपयोगकर्ता ही `done` में बदल सकता है |
| **मॉडल रूटिंग** | Plugins पृष्ठ के सेटिंग्स फ़ॉर्म से प्रति भूमिका provider, model और reasoning effort |
| **Git** | रिपॉज़िटरी प्रोत्साहित; विनाशकारी बदलाव कार्ड ब्रांच पर; स्वीकृति के बाद ही मर्ज |
| **रनटाइम** | PTC (`run_code` + जनरेट किया गया SDK), प्रति सदस्य एक subagent परत |

## किसके लिए है

- ऐसे शोध प्रोजेक्ट जो साहित्य समीक्षा, कार्यान्वयन, प्रयोग और पेपर आउटपुट को एक साथ जोड़ते हैं।
- ऐसी टीमें जिन्हें दावे से स्रोत, रन रिकॉर्ड या लॉग तक साक्ष्य की श्रृंखला चाहिए।
- ऐसे उपयोगकर्ता जो एक सामान्य-उद्देश्य वाले एजेंट की बजाय एक सलाहकार और एक स्वतंत्र समीक्षक चाहते हैं।
- ऐसा काम जहाँ अंतिम स्वीकृति का निर्णय उपयोगकर्ता को लेना चाहिए, एजेंट को नहीं।

**इसके लिए नहीं:** त्वरित तथ्यात्मक प्रश्न, एकल-फ़ाइल संपादन, या ऐसे काम जिनमें एक बार का उत्तर पर्याप्त है। यह मोड Lead को निर्देश देता है कि सरल प्रश्नों का सीधे उत्तर दे और टीम को केवल ठोस शोध के लिए सक्रिय करे।

## आवश्यकताएँ

Research Team Mode एक **प्रोफ़ाइल-स्तरीय DSH बंडल** है। बंडल उन प्रोफ़ाइल बंडलों को इंस्टॉल या सक्षम नहीं करता जिनका वह उपयोग करता है; DSH का पैकेज इंस्टॉलर npm निर्भरताओं को संभालता है, फ़ीचर बंडलों को नहीं। पहले उसी प्रोफ़ाइल में निर्भरताएँ सक्षम करें।

| क्षमता | प्रदाता | नोट्स |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | `0.2.1-rc.5` के विरुद्ध विकसित; अन्य रिलीज़ काम कर सकते हैं, परंतु गारंटी नहीं है |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | `spawn_teammate`, `send_message`, `wait_agent`, `interrupt_agent` और Team सेवाएँ प्रदान करता है |
| Task board | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | `taskboard_*` और Web GUI बोर्ड प्रदान करता है |
| PTC runtime | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) और [`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | DSH बेस का हिस्सा; `run_code` सक्षम करता है |
| Git Bash (वैकल्पिक, Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | उन एजेंटों के लिए `bash` टूल जोड़ता है जिन्हें इसकी आवश्यकता होती है |
| Web GUI | DSH Web/Desktop | सेटिंग्स फ़ॉर्म और टास्क बोर्ड के लिए आवश्यक |

यदि कोई निर्भरता अनुपस्थित है, तो मोड फिर भी आंशिक रूप से लोड हो सकता है, लेकिन टीम टूल, बोर्ड या सेटिंग्स पृष्ठ उपलब्ध नहीं होंगे। प्लगइन मैनेजर इन बंडलों के लिए संकेत नहीं देता और उन्हें स्वतः लिंक नहीं करता।

## इंस्टॉल

यह रिपॉज़िटरी एक स्थानीय DSH बंडल है। किसी चेकआउट से:

1. लक्ष्य प्रोफ़ाइल में **पूर्वापेक्षाएँ सक्षम करें**:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - Task board: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - Windows पर वैकल्पिक रूप से [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell)।
2. Plugins पृष्ठ/plugin manager की install क्रिया से, स्थानीय लिंक का उपयोग करते हुए **इस बंडल को इंस्टॉल करें**:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   स्थानीय फ़ोल्डर पथ भी काम करता है। यदि आप इस चेकआउट से अपडेट करना चाहते हैं तो लिंक रखें; फ़ोल्डर बदलने के बाद पुनः इंस्टॉल करें।
3. **DSH पुनः प्रारंभ करें।** प्रीसेट पंक्तियाँ और बंडल का क्लाइंट भाग स्टार्टअप पर लोड होते हैं।
4. उसी प्रोफ़ाइल में **जाँचें कि बंडल सक्षम है**।
5. **नया सत्र खोलें** और मोड चयनकर्ता में **Research Team Mode** चुनें।
6. टास्क-बोर्ड निष्पादन सत्रों के लिए, `presetId=research-team` के साथ कार्ड बनाएँ ताकि निष्पादन उसी पर्सोना और टूल का उपयोग करे।

> यह मोड एक प्रोफ़ाइल-स्तरीय बंडल है: इसे एक प्रोफ़ाइल में इंस्टॉल करने से वह दूसरी प्रोफ़ाइल में सक्षम नहीं होता। प्रत्येक प्रोफ़ाइल के लिए इंस्टॉल और पूर्वापेक्षा के चरण दोहराएँ।

## पहला रन

वास्तविक काम शुरू करने से पहले Lead से वातावरण और बोर्ड की जाँच करने को कहें:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

एक विशिष्ट पहला कार्य:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create(presetId=research-team) -> dispatch
Members: claim cards -> execute -> checklist + execution report -> in_review
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## डिफ़ॉल्ट टीम

| भूमिका | ज़िम्मेदारी |
| --- | --- |
| `advisor` | दिशा, फ़्रेमिंग, केंद्रीय दावों, साक्ष्य की पर्याप्तता और पेपर रणनीति का स्वतंत्र मूल्यांकन; आगे बढ़ने / संशोधित करने / रोकने की सिफ़ारिश करता है। केवल सलाहकार, गेट नहीं |
| `researcher` | साहित्य खोज, अधिग्रहण, गहन पठन, साक्ष्य निष्कर्षण, और दावा → स्रोत → स्थान साक्ष्य तालिका |
| `data` | बाहरी डेटासेट और मॉडल भार का अधिग्रहण, जिसमें स्रोत की उपलब्धता और लाइसेंस/पहुँच स्थिति, पुनःआरंभ और दर-सीमा प्रबंधन वाले डाउनलोड टूल, प्रकाशक हैश के विरुद्ध अखंडता सत्यापन, अनपैकिंग, manifest अनुबंध, एक छोटा सत्यापित नमूना और डिस्क बहीखाता शामिल है। प्रशिक्षण कोड नहीं लिखता और मूल्यांकन प्रोटोकॉल नहीं बदलता |
| `builder` | कोड, कॉन्फ़िगरेशन, डेटा पाइपलाइन, टेस्ट और पुनरुत्पाद्य एंट्री पॉइंट; लंबे प्रशिक्षण रन नहीं |
| `runner` | प्रशिक्षण/मूल्यांकन प्रारंभ करना और निगरानी करना; run ids, configs, seeds, metrics, logs, checkpoints और artifact paths रिकॉर्ड करता है |
| `reviewer` | साहित्य नोट्स, कोड, परिणाम और पेपर के दावों/उद्धरणों का स्वतंत्र सत्यापन; अवरोधक साक्ष्य के साथ PASS/FAIL |
| `writer` | LaTeX पेपर ड्राफ़्ट: गद्य, अनुभाग, तालिकाएँ, कैप्शन, उद्धरण और फ़िगर कोड; प्रयोग नहीं चलाता और कोड/मॉडल नहीं बदलता |

Lead लक्ष्य-स्पष्टीकरण, कार्य-विभाजन, बोर्ड प्रबंधन, प्रेषण, एकीकरण, सारांश, अंतिम एसेट असेंबली और डिलीवरी का मालिक है। सदस्य किसी सीमित उप-कार्य के लिए एक subagent परत का उपयोग कर सकते हैं; वे टीममेट नहीं बना सकते।

## टास्क बोर्ड वर्कफ़्लो

```text
User goal
Lead:  research_project -> taskboard_create (checklist, presetId=research-team)
       -> comment the owner -> send_message
Member: taskboard_get (read comments) -> taskboard_move todo -> in_progress
       -> work -> taskboard_checklist (with evidence) -> taskboard_execution_report
       -> taskboard_comment_add -> taskboard_move -> in_review
Reviewer: independent PASS/FAIL with evidence
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

बोर्ड ही एकमात्र टास्क लेजर है। डिलीवरेबल की ट्रैकिंग केवल चैट में न रखें। `team_task_*` क्षणिक समन्वय के लिए है, डिलीवरेबल के लिए नहीं।

## Git वर्कफ़्लो

यह मोड शोध कोड और कॉन्फ़िगरेशन को संस्करण नियंत्रण में रखने को प्रोत्साहित करता है, पर स्वयं कोई रिपॉज़िटरी नहीं बनाता। जब किसी प्रोजेक्ट में रिपॉज़िटरी न हो, तो Lead `git init` का प्रस्ताव रखता है और उपयोगकर्ता की पुष्टि की प्रतीक्षा करता है।

विनाशकारी या जोखिम भरे परिवर्तन कार्ड के नाम वाली ब्रांच पर होते हैं, जैसे `task/<title>+<id>`, न कि सीधे डिफ़ॉल्ट ब्रांच पर। कार्ड base और head कमिट दर्ज करता है, और reviewer कोड समीक्षा के आधार के रूप में `git diff <base>..<head>` पढ़ता है और स्वीकृति जाँच भी दोबारा चलाता है।

ब्रांच का मर्ज कार्ड के स्वीकार होने के बाद ही होता है, फिर उसे हटा दिया जाता है। डेटासेट, चेकपॉइंट, लॉग और कैश जैसे उत्पन्न आर्टिफ़ैक्ट रिपॉज़िटरी से बाहर रहते हैं। यदि प्रोजेक्ट git रिपॉज़िटरी नहीं है, तो समीक्षा फ़ाइल-हैश स्नैपशॉट और कार्ड पर दर्ज साक्ष्य पर आधारित होती है।

## प्रति-भूमिका मॉडल सेटिंग्स

खोलें:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

प्रत्येक डिफ़ॉल्ट सदस्य एक पंक्ति में होता है:

- **Model**: एक ड्रॉपडाउन जिसमें प्रत्येक provider के models होते हैं, साथ में क्लिक न किए जा सकने वाले provider समूह शीर्षक। मॉडल चुनने से provider और model दोनों सेट होते हैं।
- **Reasoning effort**: दूसरा ड्रॉपडाउन जिसमें चयनित मॉडल के घोषित reasoning efforts होते हैं, साथ में एक model-default विकल्प।

खाली model का अर्थ है "Lead का रूट इनहेरिट करें"; खाली effort का अर्थ है "मॉडल डिफ़ॉल्ट का उपयोग करें"। जब `model` छोड़ा जाता है तो `spawn_teammate_with_model` प्रति-भूमिका डिफ़ॉल्ट पढ़ता है; स्पष्ट `model` उसे ओवरराइड करता है। सादा `spawn_teammate` सदैव Lead को इनहेरिट करता है।

पंक्ति का नाम मायने रखता है: `research-team-settings` को **package root** `@local/dsh-research-team-preset` पर ही रहना चाहिए। DSH का client-module स्कैनर केवल सटीक package-root पंक्तियों के लिए `dsh.client` खोजता है; कोई subpath नाम host plugin को शुरू करता है पर पृष्ठ कभी लोड नहीं करता।

### सेटिंग्स कहाँ संग्रहीत होती हैं

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "roles": {
    "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
    "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
  }
}
```

- JSON फ़ाइल ही सत्य का स्रोत है। host plugin इसे स्टार्टअप पर लोड करता है; `getSettings()` और `modelForRole()` इससे ताज़ा करते हैं, इसलिए पृष्ठ और अगला teammate नवीनतम मान देखते हैं।
- अनुपस्थित या अस्थायी रूप से अपठनीय फ़ाइल अंतिम अच्छे इन-मेमोरी स्नैपशॉट को बनाए रखती है, उसे साफ़ नहीं करती।
- सेटिंग्स फ़ाइल इस रिपॉज़िटरी में **नहीं** है। इसे अलग से बैकअप करें। यह प्रति `DSH_HOME` है, प्रति प्रोफ़ाइल नहीं।
- कोई क्रेडेंशियल संग्रहीत नहीं होते; केवल provider/model/effort स्ट्रिंग।
- सेटिंग्स सहेजना DSH पुनः प्रारंभ के बिना लागू होता है। पुनः प्रारंभ सेटिंग्स पंक्ति/client पृष्ठ के पहले इंस्टॉल और प्रीसेट/plugin परिवर्तनों के लिए आवश्यक है।
- संस्करण 0.1.0 पहले के बिल्डों में एक loader बग ठीक करता है: फ़ाइल भूमिकाओं को `"roles"` के अंतर्गत लपेटती है, और पुराना loader पूरे ऑब्जेक्ट को role normalizer को देता था, जिससे पुनः प्रारंभ के बाद सभी सेटिंग्स खाली हो जाती थीं। वर्तमान loader `"roles"` को खोलता है और संगतता के लिए एक सादा role map भी समर्थित करता है।

## कॉन्फ़िगरेशन संदर्भ

| सेटिंग | स्थान | नोट्स |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`; टास्क कार्डों में `presetId=research-team` का उपयोग करना चाहिए |
| Persona | `cordis.patch.yml` | अंग्रेज़ी सिस्टम प्रॉम्प्ट; मोड-व्यापी नियम |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | `spawn_teammate_with_model` और उसके service wrapper को हटाने के लिए `false` सेट करें |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | modeled spawn टूल द्वारा उपयोग किए जाने वाले subagent प्रदाता; डिफ़ॉल्ट `spawn` / `fork` |
| `research-team-settings` row | `cordis.patch.yml` | शीर्ष-स्तरीय host row; package-root नाम बनाए रखें |
| प्रति-भूमिका रूट | `$DSH_HOME/research-team-settings.json` | सात डिफ़ॉल्ट भूमिकाओं के लिए provider/model/reasoningEffort |

## रिपॉज़िटरी लेआउट

```text
research-team-preset/
├── README.md                     # This file (canonical, English)
├── CHANGELOG.md
├── LICENSE
├── .gitignore
├── package.json                  # DSH bundle manifest and exports
├── cordis.patch.yml              # Preset + top-level settings row
├── plugin/
│   ├── index.js                  # research_project + English task-board prompt section
│   ├── modeled-teammates.js      # spawn_teammate_with_model + activation wrapper
│   └── settings-store.js         # Shared settings snapshot + disk refresh
├── settings/
│   └── index.js                  # Settings file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config form (model/effort dropdowns)
└── docs/
    ├── README.zh-CN.md
    ├── README.zh-TW.md
    ├── README.ja.md
    ├── README.ko.md
    ├── README.de.md
    ├── README.fr.md
    ├── README.es.md
    ├── README.pt-BR.md
    ├── README.ru.md
    ├── README.ar.md
    └── README.hi.md
```

## यह कैसे काम करता है

- **Preset**: `cordis.patch.yml` persona, tool rows, modeled-teammates submodule और शीर्ष-स्तरीय settings row घोषित करता है।
- **Task-board prompt**: `plugin/index.js` प्रीसेट स्कोप पर एक अंग्रेज़ी प्रोटोकॉल अनुभाग (`plugin:dsh-taskboard`) पंजीकृत करता है और वर्तमान workspace हल करने के लिए `research_project` प्रदान करता है।
- **Per-role routing**: `plugin/modeled-teammates.js` `subagents.startActivation` को `AsyncLocalStorage` के साथ लपेटता है और `agentOptions` केवल `spawn_teammate_with_model` कॉल के लिए इंजेक्ट करता है। आधिकारिक Agent Teams पैकेज अछूता रहता है।
- **Settings**: `settings/index.js` JSON फ़ाइल लोड/सेव करता है और `GET/POST /api/dsh-research-team-settings` सर्व करता है; `client/index.js` `plugins.row.config` के माध्यम से Plugins-पृष्ठ का row फ़ॉर्म पंजीकृत करता है।
- **Refresh**: `plugin/settings-store.js` इन-मेमोरी स्नैपशॉट रखता है, पढ़ने और spawn पर डिस्क से ताज़ा करता है, और यदि पढ़ना विफल हो तो अंतिम अच्छा स्नैपशॉट बनाए रखता है।

## सत्यापन चेकलिस्ट

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
save a role model -> restart -> page still shows it
```

सेटिंग्स पर्सिस्टेंस पथ UI के बिना जाँचा जा सकता है:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## समस्या निवारण

### पुनः प्रारंभ के बाद सेटिंग्स रीसेट होती दिखती हैं

संस्करण 0.1.0 एक ज्ञात कारण ठीक करता है: पुराना loader पूरे `{ roles: ... }` ऑब्जेक्ट को role normalizer को देता था और सभी सेटिंग्स खाली बना देता था। 0.1.0 या बाद के संस्करण में अपडेट करें, DSH पुनः प्रारंभ करें, और जाँचें कि:

- `$DSH_HOME/research-team-settings.json` मौजूद है और सहेजी गई भूमिकाएँ रखता है;
- `research-team-settings` पंक्ति का नाम ठीक `@local/dsh-research-team-preset` है;
- वर्तमान host इस चेकआउट को चला रहा है, किसी पुरानी इंस्टॉल की गई प्रति को नहीं।

### सेटिंग्स पृष्ठ Plugins में नहीं दिखता

- पंक्ति package root होनी चाहिए, `@local/dsh-research-team-preset/settings` नहीं।
- क्लाइंट भाग को इंस्टॉल के बाद DSH पुनः प्रारंभ और ब्राउज़र रीफ़्रेश चाहिए।
- जाँचें कि प्रोफ़ाइल में बंडल सक्षम है।

### टीम टूल अनुपस्थित हैं

उसी प्रोफ़ाइल में [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) सक्षम करें और पुनः प्रारंभ करें। इंस्टॉलर इसके लिए संकेत नहीं देता।

### टास्क-बोर्ड टूल अनुपस्थित हैं

उसी प्रोफ़ाइल में [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) सक्षम करें और पुनः प्रारंभ करें।

### `spawn_teammate_with_model` उपलब्ध नहीं है

submodule एक आंतरिक subagent सेवा को लपेटता है। DSH अपग्रेड activation का आकार बदल सकता है। विफलता का पाठ जाँचें; यदि wrapper इंस्टॉल नहीं हो सकता, तो `research-modeled-teammates.enabled: false` सेट करें, पुनः प्रारंभ करें, और सादा `spawn_teammate` उपयोग करें।

### प्रीसेट सूचीबद्ध नहीं है

पुष्टि करें कि बंडल इंस्टॉल और सक्षम है, DSH पुनः प्रारंभ करें, और नया सत्र खोलें। प्रीसेट घोषणाएँ स्टार्टअप पर लोड होती हैं।

### `research_project` workspace हल नहीं कर सकता

कार्यशील निर्देशिका को GUI में DSH प्रोजेक्ट/workspace के रूप में खोलें या कोई ज्ञात प्रोजेक्ट पास करें; टूल अनुमान नहीं लगाता।

## ज्ञात सीमाएँ

- प्रति-भूमिका मॉडल रूटिंग एक आंतरिक service wrapper है, आधिकारिक Agent Teams विस्तार नहीं। DSH अपग्रेड इसे तोड़ सकते हैं; fallback ऊपर प्रलेखित है।
- प्रोफ़ाइल-स्तरीय निर्भरताएँ स्वतः इंस्टॉल या सक्षम नहीं होतीं। यह रिपॉज़िटरी उन्हें प्रलेखित करती है, परंतु प्रबंधित नहीं करती।
- भूमिका सेटिंग्स `$DSH_HOME` के अंतर्गत एक स्वतंत्र JSON फ़ाइल में रहती हैं; वे DSH के मानक config export/backup का हिस्सा नहीं हैं। यदि आप मशीन बदलते हैं तो फ़ाइल कॉपी करें।
- मॉडल मेन्यू provider समूहों के साथ एक नेटिव `<select>` है, कोई खोजने योग्य कस्टम picker नहीं।
- यह मोड सत्र शुरू होने पर स्वतः सात teammates नहीं बनाता। Lead आवश्यकता के अनुसार भूमिकाएँ बनाता है।
- यह मोड उपयोगकर्ता की पुष्टि के बिना git रिपॉज़िटरी नहीं बनाता, और ब्रांच कार्ड के स्वीकार होने के बाद ही मर्ज होती है।
- सदस्य एक subagent परत का उपयोग कर सकते हैं; गहरा प्रत्यायोजन जानबूझकर अक्षम है।

## विकास

यह रिपॉज़िटरी एक स्थानीय DSH बंडल है जिसमें host कोड के लिए कोई build चरण नहीं है। क्लाइंट पृष्ठ `client/index.js` में एक पहले से बना `window.__ModuleLoader__.load` मॉड्यूल है।

विशिष्ट चक्र:

1. चेकआउट को DSH प्रोफ़ाइल में `link:` निर्भरता के रूप में इंस्टॉल करें।
2. host/client फ़ाइलें संपादित करें।
3. DSH पुनः प्रारंभ करें (प्रीसेट और क्लाइंट मॉड्यूल स्टार्टअप पर लोड होते हैं; HMR कुछ host परिवर्तन संभाल सकता है)।
4. सेटिंग्स रूट और Plugins पृष्ठ का निरीक्षण करें।

उपयोगी जाँचें:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

अभी कोई स्वचालित टेस्ट सूट नहीं है। सेटिंग्स रूट, मॉडल कैटलॉग, टास्क-बोर्ड प्रवाह और पुनः प्रारंभ पर्सिस्टेंस सबसे मूल्यवान मैनुअल जाँचें हैं।

## संस्करणन

सिमेंटिक संस्करणन। वर्तमान रिलीज़ **0.1.0** है; [CHANGELOG.md](../CHANGELOG.md) देखें। `docs/` के अंतर्गत दस्तावेज़ समान संस्करण रखते हैं।

## लाइसेंस

MIT। [LICENSE](../LICENSE) देखें।

## आभार

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) और [Cordis](https://github.com/cordiverse/cordis) पर आधारित। टास्क-बोर्ड एकीकरण [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) plugin का उपयोग करता है; टीम टूल आधिकारिक Agent Teams प्रोफ़ाइल बंडल से आते हैं। plugin लेखकों और उन सभी का धन्यवाद जो वास्तविक शोध प्रोजेक्टों पर इस मोड का परीक्षण करते हैं।

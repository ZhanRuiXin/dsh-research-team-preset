# Research Team Mode

**إعداد وكيل في DSH يحوّل جلسة واحدة إلى فريق بحث صغير ومنسّق.**

**الإصدار 0.1.0** · **آخر تحديث 2026-10-31**

<p align="center"><a href="../README.md">English</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a> · <a href="README.de.md">Deutsch</a> · <a href="README.fr.md">Français</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português (Brasil)</a> · <a href="README.ru.md">Русский</a> · <strong>العربية</strong> · <a href="README.hi.md">हिन्दी</a></p>

---

## نظرة عامة

يُعدّ Research Team Mode إعداد وكيل (agent preset) في DSH لتشغيل بحث متكامل من أوله إلى آخره كفريق، بدلًا من محادثة واحدة. يتولى الـ Lead تخطيط العمل، والاحتفاظ بالسجلّين (بطاقات اللوحة لبوابات المستخدم، ومهام الفريق للخطوات الداخلية)، وإرسال العمل، ودمج النتائج، والتحدث مع المستخدم. وتغطي سبعة أدوار متخصصة افتراضية المراجعة الاستشارية، والأدبيات والأدلة، والحصول على البيانات، والشفرة، والتشغيل، والمراجعة المستقلة، وكتابة الورقة.

صُمم هذا الوضع للبحوث الممتدة على أيام أو أسابيع، والتي تحتاج إلى أدلة قابلة للتتبع وتستفيد من حدود واضحة بين الأدوار. وهو ليس وضع سؤال وجواب لمرة واحدة: فالـ Lead لا يُنشئ إلا الأدوار التي تحتاجها المهمة فعلًا.

## لمحة سريعة

| | |
| --- | --- |
| **الأدوار الافتراضية** | 7: advisor، researcher، data، builder، runner، reviewer، writer |
| **سير العمل** | قائم على البوابات: الخطوات الداخلية في `team_task_*`، وبوابات المستخدم على اللوحة؛ الإنشاء، والاعتماد، والتنفيذ، والتقرير، والمراجعة، وقبول المستخدم |
| **الإنجاز** | `in_review` هي آخر محطة للوكيل؛ ولا ينقل البطاقة إلى `done` إلا المستخدم |
| **توجيه النماذج** | provider وmodel وقوة الاستدلال لكل دور من نموذج إعدادات في صفحة Plugins |
| **Git** | يهيّئه الوكيل عند بدء العمل الجوهري؛ التغييرات المدمِّرة على فرع؛ الدمج بعد القبول فقط |
| **Worklog** | `worklog/PLAN.md` + `INDEX.md` + ملف محدود لكل بطاقة مرتبطة ببوابة؛ عند الاستئناف تُقرأ PLAN وINDEX أولًا |
| **بيئة التشغيل** | PTC (`run_code` + SDK المولَّد)، وطبقة subagent واحدة لكل عضو |

## لمن هذا الوضع

- المشاريع البحثية التي تجمع مراجعة الأدبيات والتنفيذ والتجارب وإنتاج الورقة.
- الفرق التي تحتاج إلى سلسلة أدلة تربط كل ادعاء بمصدره أو بسجل التشغيل أو بالسجل.
- المستخدمون الذين يريدون مستشارًا ومراجعًا مستقلًا بدلًا من وكيل عام واحد.
- الأعمال التي يجب أن يكون قرار القبول النهائي فيها للمستخدم لا للوكيل.

**ليس مناسبًا لـ:** الأسئلة الوقائعية السريعة، أو تعديل ملف واحد، أو المهام التي تكفيها إجابة واحدة. يوجّه الوضع الـ Lead للإجابة عن الأسئلة البسيطة مباشرةً، ولتعبئة الفريق في البحوث الجوهرية فقط.

## المتطلبات

‏Research Team Mode هو **bundle على مستوى profile** في DSH. لا يثبّت هذا الـ bundle حزم الـ profile التي يستخدمها ولا يفعّلها؛ فمثبّت حزم DSH يتعامل مع تبعيات npm، لا مع حزم الميزات. فعّل التبعيات في الـ profile نفسه أولًا.

| القدرة | المزوّد | ملاحظات |
| --- | --- | --- |
| DSH | [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) `0.2.x` | طُوِّر على `0.2.1-rc.5`؛ قد تعمل إصدارات أخرى، لكن ذلك غير مضمون |
| Agent Teams | [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) | يوفّر `spawn_teammate` و`send_message` و`wait_agent` و`interrupt_agent` و`team_task_*` وخدمات Team |
| لوحة المهام | [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) | يوفّر `taskboard_*` ولوحة Web GUI |
| بيئة PTC | [`@deepseek-ai/dsh-agent-tool-presentation`](https://github.com/deepseek-ai/deepseek-harness) و[`@deepseek-ai/dsh-ptc-runtime-node`](https://github.com/deepseek-ai/deepseek-harness) | جزء من أساس DSH؛ يتيح `run_code` |
| Git Bash (اختياري، Windows) | [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) | يضيف أداة `bash` للوكلاء الذين يحتاجون إليها |
| Web GUI | DSH Web/Desktop | مطلوب لنموذج الإعدادات ولوحة المهام |

إذا غابت إحدى التبعيات، يظل الوضع قادرًا على التحميل جزئيًا، لكن أدوات الفريق أو اللوحة أو صفحة الإعدادات ستكون غير متاحة. ولا يطلب مدير الإضافات هذه الـ bundles ولا يربطها تلقائيًا.

## التثبيت

هذا المستودع bundle محلي في DSH. بدءًا من نسخة checkout:

1. **فعّل المتطلبات المسبقة** في الـ profile المستهدف:
   - Agent Teams: [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness)
   - لوحة المهام: [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)
   - اختياريًا [`dsh-gitbash-shell`](https://github.com/KannaKuron/dsh-gitbash-shell) على Windows.
2. **ثبّت هذا الـ bundle** عبر إجراء التثبيت في صفحة Plugins/مدير الإضافات، باستخدام رابط محلي:

   ```text
   link:/absolute/path/to/research-team-preset
   ```

   كما يعمل مسار مجلد محلي أيضًا. أبقِ الرابط إذا كنت تخطّط للتحديث من نسخة الـ checkout هذه؛ وأعد التثبيت بعد استبدال المجلد.
3. **أعد تشغيل DSH.** تُحمَّل صفوف الـ preset والجزء العميل من الـ bundle عند بدء التشغيل.
4. **تحقق من تفعيل الـ bundle** في الـ profile نفسه.
5. **افتح جلسة جديدة** واختر **Research Team Mode** في محدّد الوضع.
6. لجلسات التنفيذ في لوحة المهام، أنشئ البطاقات بـ `presetId=research-team` كي يستخدم التنفيذ الشخصية (persona) والأدوات نفسها.

> الوضع bundle على مستوى profile: تثبيته في profile واحد لا يفعّله في profile آخر. كرّر خطوات التثبيت والمتطلبات المسبقة لكل profile.

## أول تشغيل

اطلب من الـ Lead التحقق من البيئة ولوحة المهام قبل بدء العمل الفعلي:

```text
list_agents        # create only the roles the task needs
research_project   # resolve the current project/workspaceId
taskboard_list     # check existing cards in this project
```

مهمة أولى نموذجية:

```text
User: "Survey the literature on X, implement the baseline, and draft the method section."
Lead: research_project -> taskboard_create only at user gates -> team_task_create -> send_message
Members: team_task_update (claim) -> work -> complete + send_message; gated steps also claim the card
Reviewer: independent PASS/FAIL with evidence
Lead: summarize -> user acceptance (done)
```

## الفريق الافتراضي

| الدور | المسؤولية |
| --- | --- |
| `advisor` | تقييم مستقل للتوجه والتأطير والادعاءات المحورية وكفاية الأدلة واستراتيجية الورقة؛ ويوصي بالمضي / التنقيح / التوقف. استشاري فقط، وليس بوابة إلزامية |
| `researcher` | البحث في الأدبيات والحصول عليها وقراءتها قراءة دقيقة واستخراج الأدلة، وبناء جدول أدلة: ادعاء → مصدر → موضع. يبحث أولًا في مكتبة Zotero المشتركة، ويستورد الورقة الكاملة في نسختها الرسمية مع ملف PDF الخاص بها عند غياب عمل مطلوب، ويزيل التكرار حسب DOI والعنوان، ويشارك مراجع `zotero://` مع الفريق |
| `data` | الحصول على مجموعات البيانات وأوزان النماذج الخارجية، بما يشمل توفّر المصدر وحالة الترخيص/الوصول، وأدوات التنزيل مع الاستئناف ومعالجة حدود المعدل، والتحقق من السلامة مقابل تجزئات الناشر، وفك الضغط، وعقد manifest، وعيّنة صغيرة موثّقة، وسجل القرص. لا يكتب شيفرة التدريب ولا يغيّر بروتوكول التقييم |
| `builder` | الشفرة والإعدادات وخطوط معالجة البيانات والاختبارات ونقاط الدخول القابلة للتكرار؛ دون تشغيل تدريبات طويلة |
| `runner` | بدء التدريب/التقييم ومراقبته؛ وتسجيل معرّفات التشغيل والإعدادات والبذور والمقاييس والسجلات ونقاط الحفظ ومسارات المخرجات |
| `reviewer` | تحقق مستقل من ملاحظات الأدبيات والشفرة والنتائج وادعاءات الورقة/اقتباساتها؛ حكم PASS/FAIL مع أدلة مانعة |
| `writer` | مسودة ورقة LaTeX: النص والأقسام والجداول والتسميات التوضيحية والاقتباسات وشيفرة الأشكال؛ ولا يشغّل التجارب ولا يغيّر الشفرة/النماذج |

يملك الـ Lead توضيح الهدف وتفكيكه وإدارة اللوحة والإرسال والدمج والتلخيصات وتجميع المخرجات النهائية والتسليم. ويجوز للأعضاء استخدام طبقة subagent واحدة لمهمة فرعية محدودة النطاق؛ ولا يمكنهم إنشاء زملاء فريق (teammates). يبقي Lead استخدامه للأدوات خفيفًا، ويفضّل تحديثًا موجزًا للمستخدم على استدعاء روتيني آخر، ويترك العمل العميق للعضو المسؤول.

### مكتبة Zotero المشتركة

يعامل researcher مكتبة Zotero الخاصة بالمستخدم بوصفها مصدر الأدبيات المشترك للفريق. فهو يبحث في المجموعات والعناصر الموجودة قبل الويب المفتوح، ويعيد استخدام ملفات PDF المرفقة ومقاطع التعليقات التوضيحية، ولا يستورد ورقة غائبة إلا في نسختها الرسمية المسجّلة (version of record)، مع إرفاق ملف PDF وحفظه في مجموعة تابعة للمشروع. وتزيل عمليات الاستيراد التكرار حسب DOI والعنوان، ولا تمس وسوم المستخدم ومجموعاته، وتسجّل مرجع العنصر `zotero://` في جدول الأدلة وعلى بطاقة اللوحة، حتى يقرأ كل زميل الورقة نفسها ويتمكن reviewer من التحقق بالعينة من الصفحات نفسها. وعندما يكون النص الكامل خلف جدار دفع أو لا تتوفر إلا البيانات الوصفية، يسجّل researcher الرابط ويضع علامة على الدليل بأنه بيانات وصفية فقط بدلًا من استيراد بديل.

## سير عمل لوحة المهام

```text
User goal
Lead:  research_project -> taskboard_create only at user gates (checklist, presetId=research-team)
       -> team_task_create (owner, blocked_by, write scopes) -> send_message
Member: team_task_update (claim) -> work -> team_task_update (complete) + send_message
Internal steps and member handoffs stay off the board; only user gates get cards
At a user gate: taskboard_get -> taskboard_move in_progress -> checklist/report -> in_review
Reviewer: independent PASS/FAIL with evidence on gated cards
Advisor: optional independent recommendation at key decisions or before submission
Lead:  summarize -> report card ids/status/evidence/risks to the user
User:  accept in the GUI -> done (agents can never move a card to done)
```

لا تحصل إلا الخطوات التي تنتظر مراجعة المستخدم أو قبوله على بطاقة في اللوحة: نقاط تسليم المخرجات، وقرارات النطاق التي يجب أن يؤكدها المستخدم، والتغييرات الخطرة، والتسليم النهائي. أما الخطوات الداخلية والمهام الفرعية المعتمدة ذاتيًا والتسليم بين الأعضاء فتُتابع في `team_task_*` وتبقى خارج اللوحة؛ وعند الوصول إلى بوابة المراجعة تحتفظ البطاقة بالمخرج وأدلته وحكم المراجعة. وينسّق أعضاء الفريق فيما بينهم باللغة الإنجليزية؛ أما الردود والبطاقات والمخرجات الموجّهة إلى المستخدم فتتبع لغة المستخدم. عندما يكون القرار أو المعلومات الناقصة من اختصاص المستخدم، يسأل Lead مباشرة عبر `ask_user_question` بدل ترك حالة انتظار على البطاقة. وإذا انتهت مهلة السؤال، يطلب Lead توصية مستقلة من المستشار ويسجلها ثم يواصل العمل.

## سير عمل Git

يهيّئ الوضع تتبعًا دائمًا عند بدء العمل الجوهري، ويقدّر الوكيل ما إذا كان الطلب عملًا حقيقيًا أم سؤالًا بسيطًا. وإذا لم تكن مساحة العمل داخل مستودع بعد، يستدعي الوكيل `research_workspace_init`، الذي ينشئ `worklog/PLAN.md` و`worklog/INDEX.md` وينفّذ `git init`. ولا ينشئ مستودعًا متداخلًا أبدًا ولا يثبّت الهيكل الأولي.

تُنفَّذ التغييرات المدمِّرة أو عالية المخاطر على فرع يحمل اسم الخطوة، مثل `task/<title>+<id>` (البطاقة للعمل المرتبط ببوابة، ومهمة الفريق للعمل الداخلي)، بدلًا من تعديل الفرع الافتراضي مباشرة. وتسجّل البطاقة أو مهمة الفريق كوميتَي base وhead، ويقرأ reviewer ناتج `git diff <base>..<head>` أساسًا لمراجعة الشيفرة، ويعيد تشغيل فحوص القبول أيضًا.

لا يُدمج الفرع إلا بعد قبول البطاقة، ثم يُحذف. وتبقى المخرجات المولّدة مثل مجموعات البيانات ونقاط الحفظ والسجلات والذاكرات المؤقتة خارج المستودع. وإذا لم يكن المشروع مستودع git، تعتمد المراجعة على لقطة تجزئات الملفات والأدلة المسجلة على البطاقة.

## Worklog

العمل الذي قد يمتد عبر جلسات يحتفظ بسجل صغير ومحدود بجوار الشيفرة. يحتوي `worklog/PLAN.md` على الهدف والمرحلة الحالية والبطاقات النشطة والعوائق والقرارات المؤرخة؛ ويحتوي `worklog/INDEX.md` على سطر لكل بطاقة نشطة. ولكل بطاقة `worklog/<task-id>.md` فيه كتلة الحالة الحالية في الأعلى وإدخالات قصيرة تُضاف أسفلها.

عند الاستئناف يقرأ الوكيل PLAN وINDEX أولًا، ثم كتلة حالة البطاقة المستهدفة وذيلها فقط، ولا يقرأ الملف كاملًا ولا الدليل كاملًا. يبقى PLAN ضمن نحو 100 سطر وملفات البطاقات ضمن نحو 200، وتُزال البطاقات المكتملة من الفهرس. القوالب المكثفة للملفات الثلاثة موجودة في persona الإعداد المسبق، فيمكن لأي جلسة إنشاؤها أو تحديثها دون قراءة هذا المستودع.

## ملفات تعريف نموذج الفريق

تحتفظ صفحة الإعدادات بعدة ملفات تعريف نموذج مسمّاة لأعضاء الفريق الافتراضيين، وتستخدم الملف المحدد عند الإنشاء (spawn) التالي.

افتح:

```text
Plugins → @local/dsh-research-team-preset → research-team-settings → Configure
```

شريط ملفات التعريف أعلى الصفحة:

- **التبديل** إلى ملف التعريف (القائمة المنسدلة `团队配置`) الذي يستخدمه العضو الافتراضي التالي.
- **新建配置** يضيف ملف تعريف بسبعة صفوف أدوار فارغة.
- **配置名称** يعيد تسمية ملف التعريف المحدد. الأسماء مطلوبة وفريدة وبحد أقصى 60 حرفًا.
- **删除配置** يحذف ملف التعريف المحدد بعد نقرة تأكيد ثانية. ولا يمكن حذف آخر ملف تعريف متبقٍّ.

لكل ملف تعريف صف واحد لكل عضو افتراضي:

- **Model**: قائمة منسدلة واحدة تضم نماذج كل المزوّدين، مع عناوين مجموعات مزوّدين غير قابلة للنقر. اختيار نموذج يضبط provider وmodel معًا.
- **Reasoning effort**: قائمة منسدلة ثانية تضم قوى الاستدلال المعلنة للنموذج المحدد، إضافةً إلى خيار القيمة الافتراضية للنموذج.

النموذج الفارغ يعني «وراثة مسار الـ Lead»؛ وقوة الاستدلال الفارغة تعني «استخدام القيمة الافتراضية للنموذج». يقرأ `spawn_teammate_with_model` القيمة الافتراضية للدور من ملف التعريف المحدد عندما يُحذف `model`؛ ويَغلِب عليه `model` الصريح. أما `spawn_teammate` العادي فيرث الـ Lead دائمًا.

تُحفظ قائمة ملفات التعريف كاملةً معًا، لذا لا يلغي التبديل بين ملفات التعريف التعديلات التي أُجريت في ملف آخر. وتتحقق الصفحة من الأسماء قبل الحفظ وتعرض نص خطأ الخادم عندما يُرفض الحفظ.

اسم الصف مهم: يجب أن يبقى `research-team-settings` في **جذر الحزمة** `@local/dsh-research-team-preset`. فماسح وحدات العميل في DSH لا يكتشف `dsh.client` إلا في صفوف جذر الحزمة بالضبط؛ أما الاسم بمسار فرعي فيشغّل إضافة المضيف لكنه لا يحمّل الصفحة أبدًا.

### أين تُخزَّن الإعدادات

```text
$DSH_HOME/research-team-settings.json
```

```json
{
  "version": 2,
  "activeProfileId": "default",
  "profiles": [
    {
      "id": "default",
      "name": "默认配置",
      "roles": {
        "advisor": { "provider": "example-provider", "model": "example-model", "reasoningEffort": "high" },
        "researcher": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    },
    {
      "id": "p-example",
      "name": "快速实验",
      "roles": {
        "advisor": { "provider": "", "model": "", "reasoningEffort": "" }
      }
    }
  ]
}
```

- يسمّي `activeProfileId` ملف التعريف الذي يستخدمه الزميل التالي. ويرجع الخادم إلى ملف التعريف الأول عندما يكون غائبًا أو غير معروف.
- يُنقل الملف القديم (`{ "roles": { ... } }` أو خريطة أدوار مجرّدة) في الذاكرة إلى ملف تعريف واحد باسم `默认配置`؛ ويُعاد كتابة الملف بشكل ملفات التعريف عند الحفظ التالي. ويحدّث `POST { "roles": ... }` القديم ملف التعريف النشط فقط، فلا تستطيع السكربتات الأقدم إسقاط ملفات التعريف الأخرى.
- ملف JSON هو مصدر الحقيقة. تحمّله إضافة المضيف عند بدء التشغيل؛ ويُحدَّث `getSettings()` و`modelForRole()` منه، فترى الصفحة والزميل التالي أحدث القيم.
- الملف الغائب أو غير القابل للقراءة مؤقتًا يُبقي آخر نسخة سليمة في الذاكرة بدل مسحها.
- ملف الإعدادات **ليس** في هذا المستودع. احتفظ بنسخة احتياطية منه بشكل منفصل. وهو لكل `DSH_HOME`، لا لكل profile.
- لا تُخزَّن أي بيانات اعتماد؛ بل أسماء ملفات التعريف وسلاسل provider/model/effort فقط.
- تُطبَّق عمليات حفظ الإعدادات دون إعادة تشغيل DSH: فيُعيد المخزن قراءة الملف، ويحدّد الإنشاء (spawn) التالي ملف التعريف النشط. أما تغيير شيفرة هذه الإضافة نفسها فيظل يحتاج إلى إعادة تشغيل DSH، لأن نصف المضيف يسجّل مسار WebSocket/HTTP وخانة صفحة Plugins على مستوى المضيف.
- يصلح الإصدار 0.1.0 خللًا في المحمّل في البِنى الأقدم: فالملف يلفّ الأدوار تحت `"roles"`، وكان المحمّل القديم يمرّر الكائن كاملًا إلى مُطبِّع الأدوار، فتنتج إعدادات فارغة تمامًا بعد إعادة التشغيل. أما المحمّل الحالي فيفكّ `"roles"`، وينقل الملفات القديمة، ويدعم خريطة أدوار مجرّدة للتوافق.

## مرجع الإعدادات

| الإعداد | الموقع | ملاحظات |
| --- | --- | --- |
| Preset id | `cordis.patch.yml` | `research-team`؛ ويُستحسن أن تستخدم بطاقات المهام `presetId=research-team` |
| Persona | `cordis.patch.yml` | system prompt بالإنكليزية؛ قواعد تشمل الوضع كله |
| `research-modeled-teammates.enabled` | `cordis.patch.yml` | اضبطه على `false` لإزالة `spawn_teammate_with_model` وغلاف الخدمة الخاص به |
| `freshProvider` / `forkProvider` | `cordis.patch.yml` | مزوّدو subagent الذين تستخدمهم أداة الإنشاء النموذجية؛ القيم الافتراضية `spawn` / `fork` |
| صف `research-team-settings` | `cordis.patch.yml` | صف مضيف من المستوى الأعلى؛ أبقِ اسم جذر الحزمة |
| ملفات تعريف نموذج الفريق | `$DSH_HOME/research-team-settings.json` | ملفات تعريف مسمّاة؛ يوفّر ملف التعريف النشط provider/model/reasoningEffort للأدوار الافتراضية السبعة |

## بنية المستودع

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
│   └── settings-store.js         # Shared profile snapshot + disk refresh
├── settings/
│   └── index.js                  # Profile file + /api/dsh-research-team-settings
├── client/
│   └── index.js                  # plugins.row.config profile editor (model/effort dropdowns)
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

## كيف يعمل

- **Preset**: يعلن `cordis.patch.yml` الشخصية (persona) وصفوف الأدوات والوحدة الفرعية modeled-teammates وصف الإعدادات من المستوى الأعلى.
- **موجّه لوحة المهام**: يسجّل `plugin/index.js` قسم بروتوكول إنكليزي (`plugin:dsh-taskboard`) في نطاق الـ preset، ويوفّر `research_project` لتحديد مساحة العمل الحالية.
- **التوجيه لكل دور**: يغلّف `plugin/modeled-teammates.js` الدالة `subagents.startActivation` بـ `AsyncLocalStorage` ويحقن `agentOptions` عند نداء `spawn_teammate_with_model` فقط. وحزمة Agent Teams الرسمية لم تُمسّ. يعرض Cordis الخدمات كوسيط قابل للتتبع، لذا يتحقق الغلاف من واصف الخاصية الخاص به بدلاً من هوية الدالة.
- **الإعدادات**: يحمّل `settings/index.js` ملف JSON لملفات التعريف ويحفظه ويقدّم `GET/POST /api/dsh-research-team-settings`؛ ويسجّل `client/index.js` محرّر ملفات التعريف في صفحة Plugins عبر `plugins.row.config`.
- **التحديث**: يحتفظ `plugin/settings-store.js` بالنسخة في الذاكرة، ويحدّد ملف التعريف النشط عند كل قراءة وكل إنشاء (spawn)، ويُبقي آخر نسخة سليمة إذا فشلت القراءة.

## قائمة التحقق

```text
plugin_manager list_plugins              # bundle active
Config.listConfigs name=@deepseek-ai/dsh-agent-preset   # include:preset-research-team
new session -> Research Team Mode
list_agents                              # roles can be created
research_project                         # returns the current workspaceId
taskboard_list                           # matches the GUI board
Plugins -> bundle -> research-team-settings -> Configure   # page visible
新建配置 -> أعطه اسمًا -> احفظ -> أعد فتح الصفحة -> يظهر ملفا التعريف
اختر ملف تعريف آخر -> احفظ -> يستخدمه spawn_teammate_with_model
احذف ملف تعريف واحدًا -> احفظ -> لا يبقى إلا ملف التعريف المتبقي
ملف قديم {roles} -> أعد التشغيل -> يظهر باسم 默认配置
احفظ نموذج دور -> أعد التشغيل -> تظل الصفحة تعرضه
```

يمكن التحقق من مسار حفظ الإعدادات دون الواجهة:

```text
GET/POST http://127.0.0.1:<port>/api/dsh-research-team-settings
```

## استكشاف الأخطاء وإصلاحها

### يبدو أن الإعدادات تُعاد ضبطها بعد إعادة التشغيل

يصلح الإصدار 0.1.0 السبب المعروف: كان المحمّل القديم يمرّر الكائن `{ roles: ... }` كاملًا إلى مُطبِّع الأدوار فينتج إعدادات فارغة تمامًا. حدّث إلى 0.1.0 أو أحدث، وأعد تشغيل DSH، ثم تحقق من:

- وجود `$DSH_HOME/research-team-settings.json` واحتوائه على ملفات التعريف المحفوظة؛
- الملفات القديمة `{ "roles": ... }` تُعرض كملف تعريف واحد باسم `默认配置`، ويُعاد كتابتها بشكل ملفات التعريف عند الحفظ التالي؛
- أن صف `research-team-settings` مسمّى بالضبط `@local/dsh-research-team-preset`؛
- أن المضيف الحالي يشغّل نسخة الـ checkout هذه، لا نسخة مثبَّتة قديمة.

### صفحة الإعدادات لا تظهر في Plugins

- يجب أن يكون الصف هو جذر الحزمة، لا `@local/dsh-research-team-preset/settings`.
- يحتاج الجزء العميل إلى إعادة تشغيل DSH وتحديث المتصفح بعد التثبيت.
- تحقق من تفعيل الـ bundle في الـ profile.

### أدوات الفريق مفقودة

فعّل [`@deepseek-ai/dsh-experimental-agent-team-profile`](https://github.com/deepseek-ai/deepseek-harness) في الـ profile نفسه وأعد التشغيل. فالمثبّت لا يطلب ذلك.

### أدوات لوحة المهام مفقودة

فعّل [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard) في الـ profile نفسه وأعد التشغيل.

### الأداة `spawn_teammate_with_model` غير متاحة

تلتفّ هذه الوحدة الفرعية حول خدمة subagent داخلية. وقد تغيّر ترقية DSH شكل التنشيط. تحقق من نص الفشل؛ وإن لم يتمكن الغلاف من التثبيت، فاضبط `research-modeled-teammates.enabled: false`، وأعد التشغيل، واستخدم `spawn_teammate` العادي.

### الـ preset غير مدرج

تأكد من تثبيت الـ bundle وتفعيله، وأعد تشغيل DSH، وافتح جلسة جديدة. فإعلانات الـ preset تُحمَّل عند بدء التشغيل.

### الأداة `research_project` لا تستطيع تحديد مساحة العمل

افتح دليل العمل كمشروع/مساحة عمل في DSH من الـ GUI، أو مرّر مشروعًا معروفًا؛ فالأداة لا تخمّن.

## القيود المعروفة

- توجيه النموذج لكل دور هو غلاف خدمة داخلي، لا امتداد رسمي من Agent Teams. وقد تؤدي ترقيات DSH إلى تعطيله؛ والبديل موثّق أعلاه.
- تبعيات مستوى الـ profile لا تُثبَّت ولا تُفعَّل تلقائيًا. هذا المستودع يوثّقها ولا يديرها.
- تعيش ملفات تعريف نموذج الفريق في ملف JSON مستقل تحت `$DSH_HOME`؛ وهي ليست جزءًا من تصدير/نسخ إعدادات DSH القياسي. انسخ الملف إذا انتقلت إلى جهاز آخر.
- قائمة النماذج هي عنصر `<select>` أصلي بمجموعات مزوّدين، وليست منتقيًا مخصصًا قابلًا للبحث.
- لا ينشئ الوضع سبعة زملاء تلقائيًا عند بدء الجلسة. فالـ Lead يُنشئ الأدوار بحسب ما تحتاجه المهمة.
- لا يهيّئ الوضع مستودعًا داخل مستودع قائم أبدًا، ولا يثبّت من تلقاء نفسه سجل العمل أو هيكل المستودع.
- يجوز للأعضاء استخدام طبقة subagent واحدة؛ أما التفويض الأعمق فمعطَّل عن قصد.

## التطوير

هذا المستودع bundle محلي في DSH دون خطوة بناء لشيفرة المضيف. وصفحة العميل وحدة `window.__ModuleLoader__.load` مبنية مسبقًا في `client/index.js`.

دورة العمل النموذجية:

1. ثبّت نسخة الـ checkout كتبعية `link:` في profile من DSH.
2. عدّل ملفات المضيف/العميل.
3. أعد تشغيل DSH (تُحمَّل وحدات الـ preset والعميل عند بدء التشغيل؛ وقد يتولى HMR بعض تغييرات المضيف).
4. افحص مسار الإعدادات وصفحة Plugins.

فحوص مفيدة:

```bash
node --check settings/index.js
node --check plugin/index.js
node --check plugin/modeled-teammates.js
node --check client/index.js
```

لا توجد مجموعة اختبارات آلية بعد. ومسار الإعدادات وكتالوج النماذج وسير عمل لوحة المهام والاستمرارية بعد إعادة التشغيل هي الفحوص اليدوية الأعلى قيمة.

## إدارة الإصدارات

ترقيم دلالي للإصدارات (semantic versioning). الإصدار الحالي هو **0.1.0**؛ راجع [CHANGELOG.md](../CHANGELOG.md). وتحمل الوثائق تحت `docs/` الإصدار نفسه.

## الترخيص

MIT. راجع [LICENSE](../LICENSE).

## شكر وتقدير

بُني على [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) و[Cordis](https://github.com/cordiverse/cordis). يستخدم تكامل لوحة المهام إضافة [`dsh-taskboard`](https://github.com/cloader/dsh-taskboard)؛ وأدوات الفريق تأتي من bundle الـ profile الرسمي Agent Teams. شكرًا لمؤلفي الإضافات ولكل من يختبر الوضع في مشاريع بحثية حقيقية.

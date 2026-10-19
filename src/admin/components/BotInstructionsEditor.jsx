import { Plus, Trash2 } from "lucide-react";
import { EMPTY_BOT_INSTRUCTIONS } from "../../data/productInstructions";
import { inputClass, quietButtonClass } from "./formStyles";

function Section({ title, detail, children, onAdd, addLabel }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {detail ? <p className="mt-0.5 text-sm text-slate-500">{detail}</p> : null}
        </div>
        <button type="button" onClick={onAdd} className={quietButtonClass}>
          <Plus size={16} />
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RemoveButton({ onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
    >
      <Trash2 size={16} />
    </button>
  );
}

export default function BotInstructionsEditor({ value, onChange, onLoadTemplate }) {
  const instructions = value || EMPTY_BOT_INSTRUCTIONS;

  function setSection(key, next) {
    onChange({ ...instructions, [key]: next });
  }

  function updateItem(key, index, patch) {
    setSection(
      key,
      instructions[key].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(key, index) {
    setSection(
      key,
      instructions[key].filter((_, itemIndex) => itemIndex !== index),
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Product instructions</h2>
          <p className="mt-1 text-sm text-slate-500">
            These sections appear in the product bot and Bot Instructions tab. Leave empty to use the category template.
          </p>
        </div>
        {onLoadTemplate ? (
          <button type="button" onClick={onLoadTemplate} className={quietButtonClass}>
            Load category template
          </button>
        ) : null}
      </div>

      <Section
        title="Setup steps"
        detail="Shown as numbered install / connect steps."
        addLabel="Add step"
        onAdd={() => setSection("setupSteps", [...instructions.setupSteps, { step: instructions.setupSteps.length + 1, title: "", detail: "" }])}
      >
        {instructions.setupSteps.length === 0 ? (
          <p className="text-sm text-slate-400">No setup steps yet.</p>
        ) : (
          instructions.setupSteps.map((item, index) => (
            <div key={`step-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[auto_1fr_auto]">
              <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">{index + 1}</span>
              <div className="space-y-2">
                <input
                  value={item.title}
                  onChange={(event) => updateItem("setupSteps", index, { title: event.target.value })}
                  placeholder="Step title"
                  className={inputClass}
                />
                <textarea
                  value={item.detail}
                  onChange={(event) => updateItem("setupSteps", index, { detail: event.target.value })}
                  placeholder="Step detail"
                  rows={2}
                  className={inputClass}
                />
              </div>
              <RemoveButton label="Remove step" onClick={() => removeItem("setupSteps", index)} />
            </div>
          ))
        )}
      </Section>

      <Section
        title="Do's and don'ts"
        detail="Care tips shown in the instructions panel."
        addLabel="Add rule"
        onAdd={() => setSection("dosAndDonts", [...instructions.dosAndDonts, { type: "do", text: "" }])}
      >
        {instructions.dosAndDonts.length === 0 ? (
          <p className="text-sm text-slate-400">No rules yet.</p>
        ) : (
          instructions.dosAndDonts.map((item, index) => (
            <div key={`rule-${index}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row">
              <select
                value={item.type}
                onChange={(event) => updateItem("dosAndDonts", index, { type: event.target.value })}
                className={`${inputClass} sm:w-28`}
              >
                <option value="do">Do</option>
                <option value="dont">Don&apos;t</option>
              </select>
              <input
                value={item.text}
                onChange={(event) => updateItem("dosAndDonts", index, { text: event.target.value })}
                placeholder="Rule text"
                className={inputClass}
              />
              <RemoveButton label="Remove rule" onClick={() => removeItem("dosAndDonts", index)} />
            </div>
          ))
        )}
      </Section>

      <Section
        title="Compatibility list"
        detail="Devices and systems this product works with."
        addLabel="Add item"
        onAdd={() => setSection("compatibilityList", [...instructions.compatibilityList, ""])}
      >
        {instructions.compatibilityList.length === 0 ? (
          <p className="text-sm text-slate-400">No compatibility items yet.</p>
        ) : (
          instructions.compatibilityList.map((item, index) => (
            <div key={`compat-${index}`} className="flex gap-2">
              <input
                value={item}
                onChange={(event) => {
                  const next = [...instructions.compatibilityList];
                  next[index] = event.target.value;
                  setSection("compatibilityList", next);
                }}
                placeholder="Compatible device or standard"
                className={inputClass}
              />
              <RemoveButton label="Remove compatibility item" onClick={() => removeItem("compatibilityList", index)} />
            </div>
          ))
        )}
      </Section>

      <Section
        title="Speed tips"
        detail="Performance tips the bot uses for speed questions."
        addLabel="Add tip"
        onAdd={() => setSection("speedTips", [...instructions.speedTips, ""])}
      >
        {instructions.speedTips.length === 0 ? (
          <p className="text-sm text-slate-400">No speed tips yet.</p>
        ) : (
          instructions.speedTips.map((item, index) => (
            <div key={`tip-${index}`} className="flex gap-2">
              <input
                value={item}
                onChange={(event) => {
                  const next = [...instructions.speedTips];
                  next[index] = event.target.value;
                  setSection("speedTips", next);
                }}
                placeholder="Performance tip"
                className={inputClass}
              />
              <RemoveButton label="Remove tip" onClick={() => removeItem("speedTips", index)} />
            </div>
          ))
        )}
      </Section>

      <Section
        title="Troubleshooting"
        detail="Problem / fix pairs for the bot and instructions tab."
        addLabel="Add issue"
        onAdd={() => setSection("troubleshooting", [...instructions.troubleshooting, { problem: "", solution: "" }])}
      >
        {instructions.troubleshooting.length === 0 ? (
          <p className="text-sm text-slate-400">No troubleshooting items yet.</p>
        ) : (
          instructions.troubleshooting.map((item, index) => (
            <div key={`fix-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <input
                  value={item.problem}
                  onChange={(event) => updateItem("troubleshooting", index, { problem: event.target.value })}
                  placeholder="Problem"
                  className={inputClass}
                />
                <textarea
                  value={item.solution}
                  onChange={(event) => updateItem("troubleshooting", index, { solution: event.target.value })}
                  placeholder="Fix / solution"
                  rows={2}
                  className={inputClass}
                />
              </div>
              <RemoveButton label="Remove issue" onClick={() => removeItem("troubleshooting", index)} />
            </div>
          ))
        )}
      </Section>

      <Section
        title="Quick FAQs"
        detail="Short Q&A the bot can match in chat."
        addLabel="Add FAQ"
        onAdd={() => setSection("quickFaqs", [...instructions.quickFaqs, { q: "", a: "" }])}
      >
        {instructions.quickFaqs.length === 0 ? (
          <p className="text-sm text-slate-400">No FAQs yet.</p>
        ) : (
          instructions.quickFaqs.map((item, index) => (
            <div key={`faq-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <input
                  value={item.q}
                  onChange={(event) => updateItem("quickFaqs", index, { q: event.target.value })}
                  placeholder="Question"
                  className={inputClass}
                />
                <textarea
                  value={item.a}
                  onChange={(event) => updateItem("quickFaqs", index, { a: event.target.value })}
                  placeholder="Answer"
                  rows={2}
                  className={inputClass}
                />
              </div>
              <RemoveButton label="Remove FAQ" onClick={() => removeItem("quickFaqs", index)} />
            </div>
          ))
        )}
      </Section>
    </section>
  );
}

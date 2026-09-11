(() => {
  const messages = {
    accepted: "Нужно согласие на обработку данных.",
    name: "Укажите имя.",
    phone: "Укажите телефон или мессенджер.",
    task: "Коротко опишите задачу: регион, бюджет, горизонт, цель.",
  };

  for (const form of document.querySelectorAll("[data-lead-form]")) {
    const submitButton = form.querySelector("[data-lead-submit]");
    const status = form.querySelector("[data-lead-status]");
    if (!(submitButton instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) continue;

    submitButton.disabled = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.hidden = true;

      const data = new FormData(form);
      const values = {
        accepted: data.get("accepted") === "on",
        name: String(data.get("name") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        task: String(data.get("task") ?? "").trim(),
      };
      const invalid = {
        accepted: !values.accepted,
        name: values.name.length < 2,
        phone: values.phone.length < 6,
        task: values.task.length < 20,
      };

      for (const [field, hasError] of Object.entries(invalid)) {
        const input = form.elements.namedItem(field);
        const error = form.querySelector(`[data-error-for="${field}"]`);
        if (input instanceof HTMLElement) input.setAttribute("aria-invalid", String(hasError));
        if (error instanceof HTMLElement) {
          error.textContent = hasError ? messages[field] : "";
          error.hidden = !hasError;
        }
      }

      if (Object.values(invalid).some(Boolean)) {
        status.textContent = "Проверьте поля формы.";
        status.hidden = false;
        return;
      }

      if (form.dataset.leadsEnabled !== "true") {
        status.textContent = "Форма готова технически, но отправка включается только после согласования Leads API и юридических текстов.";
        status.hidden = false;
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Отправляем...";

      try {
        const response = await fetch("/api/leads", {
          body: JSON.stringify({
            ...values,
            acceptedAt: new Date().toISOString(),
            consentVersion: form.dataset.consentVersion,
            source: "more-i-gory-next-static",
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) throw new Error("Lead endpoint returned an error.");
        form.reset();
        status.textContent = "Заявка отправлена. Мы вернёмся с первым шагом после обработки.";
      } catch {
        status.textContent = "Не удалось отправить заявку. Попробуйте позже или напишите напрямую.";
      } finally {
        status.hidden = false;
        submitButton.disabled = false;
        submitButton.textContent = "Отправить задачу";
      }
    });
  }
})();

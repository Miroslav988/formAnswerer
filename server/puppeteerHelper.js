import puppeteer from "puppeteer";

export async function parseGoogleForm(formUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "/usr/bin/chromium-browser",
  });
  const page = await browser.newPage();

  try {
    await page.goto(formUrl, { waitUntil: "networkidle2" });

    // Wait for form container
    await page.waitForSelector('div[role="listitem"]');

    const questions = [];

    // Function to extract questions on current page
    async function extractQuestionsOnPage() {
      const questionElements = await page.$$('div[role="listitem"] > div');

      for (const question of questionElements) {
        const title = await question
          .$eval('div[role="heading"], div[aria-label]', (el) => el.innerText)
          .catch(() => "");
        const required = await question
          .$(
            'span[aria-label="Обязательный вопрос"], span[aria-label="Required"]'
          )
          .then((el) => !!el);
        // Determine question type
        const hasRadio = (await question.$$('div[role="radio"]')).length > 0;
        const hasCheckbox =
          (await question.$$('div[role="checkbox"]')).length > 0;
        const hasMatrix =
          (await question.$$('div[role="radiogroup"]')).length > 1;
        const hasTextInput =
          (await question.$('input[type="text"], textarea')) !== null;

        let type = "open";
        if (hasMatrix) {
          type = "matrix";
        } else if (hasRadio) {
          type = "radio";
        } else if (hasCheckbox) {
          type = "checkbox";
        } else if (hasTextInput) {
          type = "open";
        }

        // Extract options if applicable
        let options = [];
        if (type === "radio" || type === "checkbox" || type === "matrix") {
          options = await question.$$eval(
            'div[role="radio"], div[role="checkbox"]',
            (nodes) =>
              nodes.map((n) => n.innerText.trim()).filter((t) => t.length > 0)
          );
          // For matrix, options might be more complex, but simplified here
        }

        questions.push({
          title,
          required,
          type,
          options,
        });
      }
    }

    // Extract questions on first page
    await extractQuestionsOnPage();

    // Check if there are multiple pages
    let nextButton = await page.$(
      'div[role="button"][aria-label="Next"], div[role="button"][aria-label="Следующая"]'
    );
    while (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(1000); // wait for page to load
      await extractQuestionsOnPage();
      nextButton = await page.$(
        'div[role="button"][aria-label="Next"], div[role="button"][aria-label="Следующая"]'
      );
    }

    await browser.close();

    return { questions };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

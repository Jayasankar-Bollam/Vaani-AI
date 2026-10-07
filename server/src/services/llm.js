import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// -----------------------------------------
// GEMINI MODELS
// -----------------------------------------

const MODELS = (
  process.env.GEMINI_MODELS ||
  "gemini-2.5-flash,gemini-2.5-flash-lite"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// -----------------------------------------
// EMBEDDING MODEL
// -----------------------------------------

const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL ||
  "gemini-embedding-001";

// -----------------------------------------
// HELPERS
// -----------------------------------------

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Request timeout")),
        ms
      )
    ),
  ]);

function getStatus(error) {
  return (
    error?.status ||
    error?.response?.status ||
    0
  );
}

function isQuotaError(error) {
  const status = getStatus(error);
  const message =
    error?.message?.toLowerCase() || "";

  return (
    status === 429 ||
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
}

function isRetryable(error) {
  const status = getStatus(error);
  const message = error?.message || "";

  return (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /500|502|503|504|timeout|temporarily unavailable/i.test(
      message
    )
  );
}

// -----------------------------------------
// EXTRACT JSON SAFELY
// -----------------------------------------

function parseJSON(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty LLM response");
  }

  let text = raw.trim();

  // Remove markdown fences
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First try normal JSON parsing
  try {
    return JSON.parse(text);
  } catch {
    // Continue with extraction
  }

  // -----------------------------------------
  // Try extracting JSON object
  // -----------------------------------------

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    const extracted = text.slice(
      start,
      end + 1
    );

    try {
      return JSON.parse(extracted);
    } catch {
      throw new Error(
        "LLM returned malformed JSON"
      );
    }
  }

  throw new Error(
    "LLM response does not contain valid JSON"
  );
}

// -----------------------------------------
// CALL GEMINI
// -----------------------------------------

async function callModel(
  prompt,
  modelName
) {
  const model = genAI.getGenerativeModel({
    model: modelName,

    generationConfig: {
      responseMimeType: "application/json",

      temperature: 0.2,
    },
  });

  const result =
    await model.generateContent(prompt);

  return result.response.text();
}

// -----------------------------------------
// ASK LLM
// -----------------------------------------

export async function askLLM(
  prompt,
  schema,
  fallback = null
) {
  const maxAttempts = 4;

  let currentPrompt = prompt;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    const modelName =
      MODELS[attempt % MODELS.length];

    try {
      console.log(
        `LLM attempt ${
          attempt + 1
        }/${maxAttempts} using ${modelName}`
      );

      const raw = await withTimeout(
        callModel(
          currentPrompt,
          modelName
        ),
        30000
      );

      console.log(
        "Gemini response received."
      );

      // -----------------------------------------
      // PARSE JSON
      // -----------------------------------------

      const json = parseJSON(raw);

      // -----------------------------------------
      // ZOD VALIDATION
      // -----------------------------------------

      const result =
        schema.safeParse(json);

      if (!result.success) {
        console.error(
          "LLM schema validation failed:",
          result.error.issues
        );

        throw new Error(
          `Schema validation failed: ${result.error.issues
            .map(
              (issue) =>
                `${issue.path.join(
                  "."
                )}: ${issue.message}`
            )
            .join(", ")}`
        );
      }

      return result.data;
    } catch (error) {
      const status = getStatus(error);

      console.error(
        `LLM attempt ${
          attempt + 1
        } failed (${modelName}) [${status}]:`,
        error.message?.slice(0, 500)
      );

      // -----------------------------------------
      // 404 MODEL NOT AVAILABLE
      // -----------------------------------------

      if (status === 404) {
        console.error(
          `Model ${modelName} is unavailable.`
        );

        continue;
      }

      // -----------------------------------------
      // 429 QUOTA / RATE LIMIT
      // -----------------------------------------

      if (isQuotaError(error)) {
        console.error(
          "Gemini quota/rate limit exceeded."
        );

        // DO NOT waste remaining attempts
        return fallback;
      }

      // -----------------------------------------
      // 5XX / TIMEOUT
      // -----------------------------------------

      if (isRetryable(error)) {
        const delay = Math.min(
          2000 * 2 ** attempt,
          16000
        );

        console.log(
          `Gemini temporarily unavailable. Retrying in ${
            delay / 1000
          }s...`
        );

        await sleep(delay);

        continue;
      }

      // -----------------------------------------
      // INVALID JSON / SCHEMA
      // -----------------------------------------

      if (
        error.message?.includes(
          "JSON"
        ) ||
        error.message?.includes(
          "Schema validation"
        )
      ) {
        console.log(
          "Retrying with stricter JSON instruction..."
        );

        currentPrompt = `
${prompt}

IMPORTANT:

Return ONLY one valid JSON object.

Do NOT return markdown.
Do NOT use code fences.
Do NOT include explanations.
Do NOT include text before or after the JSON.

Every required field must be present.

For example, if the schema requires:
- next_question
- category
- topic
- subtopic
- difficulty
- skill
- estimated_time_min
- reason

then ALL of these fields must be returned.

All string fields MUST contain strings.
Do not omit any required field.
`;
      }

      await sleep(1000);
    }
  }

  console.error(
    "All LLM attempts failed."
  );

  return fallback;
}

// -----------------------------------------
// GENERATE EMBEDDING
// -----------------------------------------

export async function embed(text) {
  if (
    !text ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    throw new Error(
      "Cannot create embedding from empty text"
    );
  }

  const model =
    genAI.getGenerativeModel({
      model: EMBEDDING_MODEL,
    });

  const maxAttempts = 3;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    try {
      console.log(
        `Embedding attempt ${
          attempt + 1
        }/${maxAttempts}`
      );

      const result =
        await withTimeout(
          model.embedContent(text),
          30000
        );

      if (
        !result?.embedding?.values
      ) {
        throw new Error(
          "Embedding response is empty"
        );
      }

      return result.embedding.values;
    } catch (error) {
      const status = getStatus(error);

      console.error(
        `Embedding attempt ${
          attempt + 1
        } failed [${status}]:`,
        error.message?.slice(0, 300)
      );

      // -----------------------------------------
      // 429
      // -----------------------------------------

      if (isQuotaError(error)) {
        throw new Error(
          "Gemini embedding quota exceeded. Please try again later."
        );
      }

      // -----------------------------------------
      // TEMPORARY ERROR
      // -----------------------------------------

      if (isRetryable(error)) {
        const delay = Math.min(
          2000 * 2 ** attempt,
          8000
        );

        console.log(
          `Embedding retry in ${
            delay / 1000
          }s...`
        );

        await sleep(delay);

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Embedding failed after multiple attempts."
  );
}
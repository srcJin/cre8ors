type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Create Card",
    endpoint: "/api/cards",
    method: "POST",
    fields: { content: "input" },
  },
  {
    name: "Get Cards",
    endpoint: "/api/cards",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Update Card",
    endpoint: "/api/cards/:id",
    method: "PATCH",
    fields: { id: "input", update: { content: "input", options: { backgroundColor: "input" } } },
  },
  {
    name: "Delete Card",
    endpoint: "/api/cards/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  {
    name: "Suggest",
    endpoint: "/api/autosuggestion/suggest",
    method: "POST",
    fields: { mapId: "input" },
  },
  {
    name: "Accept suggestion",
    endpoint: "/api/autosuggestion/accept",
    method: "POST",
    fields: { mapId: "input", cardId: "input" },
  },
  {
    name: "Reject suggestion",
    endpoint: "/api/autosuggestion/reject",
    method: "POST",
    fields: {},
  },
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${tag} name="${prefix}${name}"></${tag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});

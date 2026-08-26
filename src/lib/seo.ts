interface SeoData {
  title?: string
  description?: string
  image?: string
}

function upsertMeta(
  selector: string,
  attr: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attr, key)
    document.head.appendChild(element)
  }

  element.setAttribute("content", content)
}

export function setSeoMeta(data: SeoData) {
  const title = data.title?.trim()
  const description = data.description?.trim()
  const image = data.image?.trim()

  if (title) {
    document.title = title
    upsertMeta('meta[property="og:title"]', "property", "og:title", title)
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title)
  }

  if (description) {
    upsertMeta(
      'meta[name="description"]',
      "name",
      "description",
      description,
    )
    upsertMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    )
    upsertMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description,
    )
  }

  if (image) {
    upsertMeta('meta[property="og:image"]', "property", "og:image", image)
    upsertMeta(
      'meta[name="twitter:image"]',
      "name",
      "twitter:image",
      image,
    )
  }
}

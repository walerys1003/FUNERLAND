import { jsonLdScript } from '@/lib/seo/json-ld';

type Props = {
  data: any;
  /** Optional id for dedupe-friendly script tag. */
  id?: string;
};

/**
 * Drop-in <script type="application/ld+json"> renderer.
 * Pass any JSON-LD object or array of objects.
 *
 * Usage:
 *   <JsonLd data={howToJsonLd({ ... })} />
 *   <JsonLd data={[obj1, obj2, obj3]} />
 */
export default function JsonLd({ data, id }: Props) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}

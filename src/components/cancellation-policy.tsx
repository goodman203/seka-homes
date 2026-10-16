import { property } from "@/content/property";

export function CancellationPolicy({ id }: { id?: string }) {
  return <section id={id} className="cancellation-policy" aria-label="Cancellation policy">
    <h3>Cancellation policy</h3>
    <p>{property.cancellationPolicy.timingNote}</p>
    <ul>{property.cancellationPolicy.terms.map((term) => <li key={term}>{term}</li>)}</ul>
  </section>;
}

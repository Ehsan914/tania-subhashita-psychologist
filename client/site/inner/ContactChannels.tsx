// Contact: the ways to reach the practice, as a ruled list (design: .channels).
import { useContactDetails } from '../SiteChrome';

function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function ContactChannels({ city }: { city: string }) {
  const contact = useContactDetails();
  // The seeded address already ends with the city; only add it when it is missing.
  const address = city && !contact.address.includes(city) ? `${contact.address}, ${city}` : contact.address;

  return (
    <div className="channels" data-reveal="rise">
      {contact.phone && (
        <div>
          <span className="k">Call or WhatsApp</span>
          <span className="v"><a href={`tel:${contact.phoneHref}`}>{contact.phone}</a></span>
          {contact.hours && <span className="s">{contact.hours}</span>}
        </div>
      )}
      {contact.email && (
        <div>
          <span className="k">Email</span>
          <span className="v"><a href={`mailto:${contact.email}`}>{contact.email}</a></span>
          <span className="s">A private inbox, read only by Tania</span>
        </div>
      )}
      {address && (
        <div>
          <span className="k">Visit</span>
          <span className="v">{contact.clinic || 'MIND CARE'}</span>
          <span className="s">
            {address} · <a className="link" href={mapsSearchUrl(address)} target="_blank" rel="noopener noreferrer">Open in Maps ↗</a>
          </span>
        </div>
      )}
      <div>
        <span className="k">Online</span>
        <span className="v">Zoom &amp; Google Meet</span>
        <span className="s">Secure video links for online sessions</span>
      </div>
    </div>
  );
}

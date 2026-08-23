import type { BlockComponents } from '../index';
import {
  Hero, Highlights, HouseTypes, Specs, Facilities, Gallery, Location, FloorPlans,
  PricePromo, Testimonials, Developer, Faq, AgentCta, ContactFormBlock, Header, Footer,
} from './blocks';

export const softLuxuryComponents = {
  hero: Hero, gallery: Gallery, highlights: Highlights, houseTypes: HouseTypes,
  specs: Specs, facilities: Facilities, floorPlans: FloorPlans, location: Location,
  faq: Faq, agentCta: AgentCta, contactForm: ContactFormBlock,
  pricePromo: PricePromo, developer: Developer, testimonials: Testimonials,
} satisfies BlockComponents;

export const softLuxuryChrome = { Header, Footer };

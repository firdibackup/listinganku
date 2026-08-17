import { Hero } from './Hero';
import { Gallery } from './Gallery';
import { Highlights } from './Highlights';
import { HouseTypes } from './HouseTypes';
import { Specs } from './Specs';
import { Facilities } from './Facilities';
import { FloorPlans } from './FloorPlans';
import { Location } from './Location';
import { Faq } from './Faq';
import { AgentCta } from './AgentCta';
import { ContactFormBlock } from './ContactFormBlock';
import type { BlockComponents } from '../index';

export const wireframe = {
  hero: Hero, gallery: Gallery, highlights: Highlights, houseTypes: HouseTypes,
  specs: Specs, facilities: Facilities, floorPlans: FloorPlans, location: Location,
  faq: Faq, agentCta: AgentCta, contactForm: ContactFormBlock,
} satisfies BlockComponents;

export { PlaceholderBox } from './Hero';

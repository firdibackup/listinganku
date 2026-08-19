import { Hero } from './Hero';
import { Location } from './Location';
import { Highlights } from './Highlights';
import { HouseTypes } from './HouseTypes';
import { Specs } from './Specs';
import { Facilities } from './Facilities';
import { FloorPlans } from './FloorPlans';
import { Gallery } from './Gallery';
import { PricePromo } from './PricePromo';
import { Developer } from './Developer';
import { Testimonials } from './Testimonials';
import { Faq } from './Faq';
import { AgentCta } from './AgentCta';
import { ContactFormBlock } from './ContactFormBlock';
import { Header } from './Header';
import { Footer } from './Footer';
import type { BlockComponents } from '../index';

export const tropicalWarmComponents = {
  hero: Hero, gallery: Gallery, highlights: Highlights, houseTypes: HouseTypes,
  specs: Specs, facilities: Facilities, floorPlans: FloorPlans, location: Location,
  faq: Faq, agentCta: AgentCta, contactForm: ContactFormBlock,
  pricePromo: PricePromo, developer: Developer, testimonials: Testimonials,
} satisfies BlockComponents;

export const tropicalWarmChrome = { Header, Footer };

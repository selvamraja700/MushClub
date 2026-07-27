# MushClub — Premium Organic Mushrooms

MushClub is a premium mushroom cultivation and supply company providing fresh, hygienically grown organic mushrooms, high-yield grain spawn, and hardwood substrates to households, restaurants, and commercial growers.

## Project Versions

### Version 1.0
- Initial static layout and basic styling.
- Core HTML structure.

### Version 2.0 (Current)
- **Responsive Layout Fixes**: Fixed FAQ section alignment and layout collapsing on mobile devices. Separated Contact and Why Us sections.
- **Navigation Enhancements**:
  - Replaced JavaScript-heavy smooth scrolling offset calculations with native CSS `scroll-margin-top`.
  - Fixed mobile menu focus restoration jump bug (Menu closing would scroll to top).
  - Ensured correct anchor navigation routing (Products goes to Products, Contact goes to Contact).
  - Specific CTA routing (Enquire Now buttons intelligently route to the modal or contact section based on context).
  - Fixed active navigation tracking for mobile menu links on scroll.
- **Form Modal Integration**: Form accessibility and pointer-events handling fixed during transitions.
- **Design Preservation**: Maintained original aesthetics, typography, animations, and color scheme throughout all functional updates.

## Tech Stack
- HTML5
- Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid)
- Vanilla JavaScript (ES5/ES6)

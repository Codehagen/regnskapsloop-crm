# City Filtering Implementation for BRREG Registry

Implementation to add city-based filtering to the Norwegian Business Registry (BRREG) using postal code data.

## Completed Tasks

- [x] Analyze current BRREG filtering structure
- [x] Examine postal number register format
- [x] Understand data relationships between postal codes, cities, and municipalities
- [x] Create postal code lookup service
- [x] Add city filtering to BRREG actions
- [x] Update BRREG components to include city filter

## In Progress Tasks

- [ ] Test city filtering functionality
- [ ] Verify city data quality in database

## Future Tasks

- [ ] Optimize city lookup performance
- [ ] Add city autocomplete functionality
- [ ] Consider adding postal code filtering as well

## Implementation Plan

The postal register (`scripts/Postnummerregister-ansi.txt`) contains mapping between:
- Postal codes (4 digits)
- City/Place names 
- Municipality codes and names
- Categories (P=Post office, B=Bank, S=Service, G=Group)

Current BRREG filtering supports municipality filtering, but we need to add city filtering since businesses have postal codes that map to cities.

### Data Structure
```
Postal Code -> City Name -> Municipality
4307       -> SANDNES   -> SANDNES
1300       -> SANDVIKA  -> BÆRUM
```

### Technical Approach
1. Create a postal code lookup service that maps postal codes to cities
2. Add city filtering to the database queries
3. Update the UI to include city filter dropdown
4. Ensure the city filter works alongside existing municipality filtering

### Relevant Files

- `scripts/Postnummerregister-ansi.txt` - Norwegian postal code register ✅
- `src/lib/postal-lookup.ts` - Postal code lookup service ✅
- `src/app/actions/brreg/actions.ts` - BRREG database actions ✅
- `src/components/brreg/brreg-registry-simple-client.tsx` - Filter UI component ✅
- `src/app/brreg-registry/page.tsx` - Main BRREG registry page ✅
- `prisma/schema.prisma` - Database schema ✅

### Database Fields Available
- `businessPostalCode` - for mapping to cities
- `businessCity` - existing city field (may need verification)
- `businessMunicipality` - existing municipality field

## Notes

The postal register uses ANSI encoding and contains Norwegian characters (æ, ø, å). Need to handle encoding properly when processing the data. 
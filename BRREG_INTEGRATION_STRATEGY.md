# BRREG Integration Strategy

## Recommended Approach: Hybrid (Bulk + API)

### Phase 1: Initial Bulk Import
1. **Download full dataset** using BRREG API bulk download endpoints:
   - `GET /api/enheter/lastned/csv` - Full company dataset (your 600MB file)
   - `GET /api/underenheter/lastned/csv` - Sub-entities dataset

2. **Import to database** using enhanced import script
3. **Enable city filtering** (✅ Already implemented)

### Phase 2: Live Data Updates
1. **Periodic API updates** using BRREG update endpoints:
   - `GET /api/oppdateringer/enheter` - Get updated companies
   - `GET /api/enheter/{orgnr}` - Fetch specific company details

2. **Real-time lookups** for missing data or verification

## BRREG API Endpoints Analysis

### Key Endpoints Available:

#### 🏢 Bulk Data Download
- `GET /api/enheter/lastned/csv` - Download ALL companies (CSV)
- `GET /api/enheter/lastned` - Download ALL companies (JSON)
- `GET /api/enheter/lastned/regneark` - Download ALL companies (Excel)

#### 🔍 Search & Filter
- `GET /api/enheter` - Search companies with filters
- `GET /api/enheter/{orgnr}` - Get specific company details

#### 🔄 Updates & Changes
- `GET /api/oppdateringer/enheter` - Get recent company updates
- `GET /api/oppdateringer/underenheter` - Get recent sub-entity updates

#### 📊 Metadata
- `GET /api/organisasjonsformer` - Organization types
- `GET /api/kommuner` - Municipalities

## Implementation Plan

### Step 1: Enhanced Bulk Import Script
```bash
# Download full dataset (600MB)
curl 'https://data.brreg.no/enhetsregisteret/api/enheter/lastned/csv' -X GET -J -O

# Import with enhanced script
npm run import:brreg-full
```

### Step 2: Create Update Service
- Daily/weekly sync using update endpoints
- Background job to refresh stale data
- Real-time API fallback for missing data

### Step 3: Smart Caching Strategy
- Cache frequently accessed companies
- Invalidate cache based on update timestamps
- Fallback to API for cache misses

## Advantages of This Approach

### ✅ Bulk Import Benefits:
- **Performance**: Local database queries (milliseconds vs API calls)
- **Reliability**: No dependency on external API availability
- **Cost**: No API rate limiting concerns
- **Complex Queries**: Advanced filtering, joins, aggregations
- **Offline Capability**: Works without internet connection

### ✅ API Integration Benefits:
- **Fresh Data**: Always up-to-date information
- **Storage Efficiency**: Don't store everything locally
- **Real-time**: Get latest changes immediately
- **Validation**: Verify data accuracy

## Alternative Approaches

### Option B: Pure API Integration
**Pros**: Always fresh data, no storage overhead
**Cons**: Slower performance, API dependencies, rate limits
**Best For**: Low-volume usage, simple queries

### Option C: Pure Bulk Import
**Pros**: Fastest performance, no API dependencies  
**Cons**: Stale data, large storage requirements
**Best For**: Historical analysis, offline environments

## Next Steps

1. **Implement enhanced bulk import** for the 600MB file
2. **Create API update service** for data freshness
3. **Add API fallback** for missing/updated companies
4. **Monitor performance** and adjust strategy as needed

## File Locations

- `scripts/import-brreg-full.ts` - Enhanced bulk import script
- `src/lib/services/brreg-api.ts` - API integration service  
- `src/lib/services/brreg-sync.ts` - Data synchronization service
- `src/lib/postal-lookup.ts` - Postal code service (✅ Complete) 
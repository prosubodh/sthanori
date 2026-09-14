import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  CurrencyCode,
  PropertyType,
  PropertyWithSpacesResponseDto,
  SpaceStatus,
  SpaceType,
} from '@sthanori/shared';
import { useState } from 'react';

interface PropertyCatalogViewProps {
  properties: PropertyWithSpacesResponseDto[];
  onCreateProperty: (dto: CreatePropertyDto) => void;
  onCreateSpace: (propertyId: string, dto: CreateRentableSpaceDto) => void;
  onUpdateSpaceStatus: (propertyId: string, spaceId: string, status: SpaceStatus) => void;
}

export function PropertyCatalogView({
  properties,
  onCreateProperty,
  onCreateSpace,
  onUpdateSpaceStatus,
}: PropertyCatalogViewProps) {
  // New Property form state
  const [propName, setPropName] = useState('');
  const [propType, setPropType] = useState<PropertyType>('RESIDENTIAL_MULTIFAMILY');
  const [propCurrency, setPropCurrency] = useState<CurrencyCode>('NPR');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Nepal');

  // New Space form state
  const [selectedPropId, setSelectedPropId] = useState<string>(properties[0]?.id ?? '');
  const [spaceNumber, setSpaceNumber] = useState('');
  const [buildingBlock, setBuildingBlock] = useState('');
  const [spaceType, setSpaceType] = useState<SpaceType>('WHOLE_APARTMENT');
  const [floorLevel, setFloorLevel] = useState(1);
  const [floorAreaSqFt, setFloorAreaSqFt] = useState(650);
  const [maxOccupants, setMaxOccupants] = useState(2);
  const [baseRentAmount, setBaseRentAmount] = useState(3000000); // 30,000.00

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName.trim() || !street.trim() || !city.trim()) return;

    onCreateProperty({
      name: propName.trim(),
      propertyType: propType,
      currency: propCurrency,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      },
    });

    setPropName('');
    setStreet('');
    setCity('');
    setState('');
    setPostalCode('');
  };

  const handleSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropId || !spaceNumber.trim()) return;

    onCreateSpace(selectedPropId, {
      spaceNumber: spaceNumber.trim(),
      buildingBlock: buildingBlock.trim() || undefined,
      spaceType,
      floorLevel,
      floorAreaSqFt,
      maxOccupants,
      baseRentAmount,
    });

    setSpaceNumber('');
    setBuildingBlock('');
  };

  const formatRent = (amount: number, currency: string) => {
    const major = amount / 100;
    return `${currency} ${major.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadgeClass = (status: SpaceStatus) => {
    switch (status) {
      case 'VACANT':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'OCCUPIED':
        return 'bg-blue-950/60 text-blue-300 border-blue-800';
      case 'MAINTENANCE':
        return 'bg-amber-950/60 text-amber-300 border-amber-800';
      case 'RESERVED':
        return 'bg-purple-950/60 text-purple-300 border-purple-800';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Property & Space Catalog</h1>
        <p className="text-zinc-400 mt-1">
          Manage residential real estate inventory, building blocks, and rentable units with
          real-time status.
        </p>
      </div>

      {/* Grid: Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Add Property */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Property</h2>
          <form onSubmit={handlePropertySubmit} className="space-y-4">
            <div>
              <label htmlFor="prop-name" className="block text-sm font-medium text-zinc-300 mb-1">
                Property Name
              </label>
              <input
                id="prop-name"
                type="text"
                required
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                placeholder="e.g. Kathmandu Heights"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prop-type" className="block text-sm font-medium text-zinc-300 mb-1">
                  Type
                </label>
                <select
                  id="prop-type"
                  value={propType}
                  onChange={(e) => setPropType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="RESIDENTIAL_MULTIFAMILY">Multifamily Apartment</option>
                  <option value="SINGLE_FAMILY">Single Family Home</option>
                  <option value="CO_LIVING">Co-Living House</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="MIXED_USE">Mixed Use</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="prop-currency"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Operating Currency
                </label>
                <select
                  id="prop-currency"
                  value={propCurrency}
                  onChange={(e) => setPropCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="NPR">NPR (Nepalese Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prop-street"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Street Address
                </label>
                <input
                  id="prop-street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 10 Lazimpat"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="prop-city" className="block text-sm font-medium text-zinc-300 mb-1">
                  City
                </label>
                <input
                  id="prop-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kathmandu"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="prop-state"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  State/Province
                </label>
                <input
                  id="prop-state"
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Bagmati"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="prop-postal"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Postal Code
                </label>
                <input
                  id="prop-postal"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="44600"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="prop-country"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Country
                </label>
                <input
                  id="prop-country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              Add Property
            </button>
          </form>
        </div>

        {/* Form 2: Add Rentable Space */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Add Rentable Unit / Space</h2>
          <form onSubmit={handleSpaceSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="target-property"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Select Property
              </label>
              <select
                id="target-property"
                value={selectedPropId}
                onChange={(e) => setSelectedPropId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="space-num" className="block text-sm font-medium text-zinc-300 mb-1">
                  Space # / Unit Label
                </label>
                <input
                  id="space-num"
                  type="text"
                  required
                  value={spaceNumber}
                  onChange={(e) => setSpaceNumber(e.target.value)}
                  placeholder="e.g. Apt 101"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="space-block"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Building Block (Optional)
                </label>
                <input
                  id="space-block"
                  type="text"
                  value={buildingBlock}
                  onChange={(e) => setBuildingBlock(e.target.value)}
                  placeholder="e.g. Tower A"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="space-type"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Space Type
                </label>
                <select
                  id="space-type"
                  value={spaceType}
                  onChange={(e) => setSpaceType(e.target.value as SpaceType)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="WHOLE_APARTMENT">Whole Apartment</option>
                  <option value="PRIVATE_ROOM">Private Room (Co-living)</option>
                  <option value="COMMERCIAL_SUITE">Commercial Suite</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="floor-level"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Floor Level
                </label>
                <input
                  id="floor-level"
                  type="number"
                  required
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-zinc-300 mb-1">
                  Area (SqFt)
                </label>
                <input
                  id="sqft"
                  type="number"
                  min={1}
                  required
                  value={floorAreaSqFt}
                  onChange={(e) => setFloorAreaSqFt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="max-occ" className="block text-sm font-medium text-zinc-300 mb-1">
                  Max Occupants
                </label>
                <input
                  id="max-occ"
                  type="number"
                  min={1}
                  required
                  value={maxOccupants}
                  onChange={(e) => setMaxOccupants(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="rent-minor"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Base Rent (Cents/Paisa)
                </label>
                <input
                  id="rent-minor"
                  type="number"
                  min={0}
                  required
                  value={baseRentAmount}
                  onChange={(e) => setBaseRentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={properties.length === 0}
              className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Add Space to Selected Property
            </button>
          </form>
        </div>
      </div>

      {/* Property Inventory List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Properties & Inventory Spaces</h2>

        {properties.length === 0 ? (
          <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
            No properties added yet. Add your first property using the form above.
          </div>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {property.name}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700">
                      {property.currency}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {property.propertyType}
                    </span>
                  </h3>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    {property.address.street}, {property.address.city}, {property.address.state}{' '}
                    {property.address.postalCode}, {property.address.country}
                  </p>
                </div>
                <div className="text-sm text-zinc-400">
                  Total Units:{' '}
                  <span className="text-white font-semibold">{property.spaces.length}</span>
                </div>
              </div>

              {/* Spaces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {property.spaces.map((space) => (
                  <div
                    key={space.id}
                    className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3.5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-white text-base">
                            {space.spaceNumber}
                          </div>
                          {space.buildingBlock && (
                            <div className="text-xs text-zinc-400">{space.buildingBlock}</div>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getStatusBadgeClass(
                            space.status,
                          )}`}
                        >
                          {space.status}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-2 space-y-0.5">
                        <div>
                          Rent:{' '}
                          <span className="text-zinc-200 font-medium">
                            {formatRent(space.baseRentAmount, property.currency)}
                          </span>{' '}
                          / mo
                        </div>
                        <div>
                          Area: {space.floorAreaSqFt} sq ft | Max: {space.maxOccupants} occupants
                        </div>
                        <div>Floor: Level {space.floorLevel}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex gap-2">
                      {space.status !== 'MAINTENANCE' && (
                        <button
                          type="button"
                          onClick={() => onUpdateSpaceStatus(property.id, space.id, 'MAINTENANCE')}
                          className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded border border-zinc-700 min-h-[32px] transition-colors"
                        >
                          Mark Maintenance
                        </button>
                      )}
                      {space.status !== 'VACANT' && (
                        <button
                          type="button"
                          onClick={() => onUpdateSpaceStatus(property.id, space.id, 'VACANT')}
                          className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded border border-zinc-700 min-h-[32px] transition-colors"
                        >
                          Mark Vacant
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

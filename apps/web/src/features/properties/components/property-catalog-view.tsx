import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  CurrencyCode,
  PropertyType,
  PropertyWithSpacesResponseDto,
  SpaceStatus,
  SpaceType,
} from '@sthanori/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@sthanori/ui';
import {
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Home,
  Layers,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from 'lucide-react';
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

  // Derived portfolio metrics
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((acc, p) => acc + p.spaces.length, 0);
  const occupiedUnits = properties.reduce(
    (acc, p) => acc + p.spaces.filter((s) => s.status === 'OCCUPIED').length,
    0,
  );
  const totalMonthlyRentMinor = properties.reduce(
    (acc, p) => acc + p.spaces.reduce((sum, s) => sum + s.baseRentAmount, 0),
    0,
  );

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
    const effectivePropId = selectedPropId || properties[0]?.id;
    if (!effectivePropId || !spaceNumber.trim()) return;

    onCreateSpace(effectivePropId, {
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

  const renderStatusBadge = (status: SpaceStatus) => {
    switch (status) {
      case 'VACANT':
        return (
          <Badge variant="success" className="font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            VACANT
          </Badge>
        );
      case 'OCCUPIED':
        return (
          <Badge
            variant="secondary"
            className="font-semibold flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
          >
            <ShieldCheck className="h-3 w-3" />
            OCCUPIED
          </Badge>
        );
      case 'MAINTENANCE':
        return (
          <Badge
            variant="destructive"
            className="font-semibold flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
          >
            <Wrench className="h-3 w-3" />
            MAINTENANCE
          </Badge>
        );
      case 'RESERVED':
        return (
          <Badge variant="outline" className="font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" />
            RESERVED
          </Badge>
        );
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Property & Space Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage residential real estate inventory, building blocks, and rentable units with
          real-time status.
        </p>
      </div>

      {/* 1. Portfolio KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Properties
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                {totalProperties}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Units
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                {totalUnits}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Home className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Occupancy
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                {totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '0%'}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Portfolio Gross Rent
              </p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                {formatRent(totalMonthlyRentMinor, properties[0]?.currency ?? 'NPR')}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Add Property */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <PlusCircle className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Add New Property</CardTitle>
                <CardDescription className="text-xs">
                  Register a real estate building or land parcel in your catalog
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="prop-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Property Name
                </label>
                <Input
                  id="prop-name"
                  type="text"
                  required
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  placeholder="e.g. Kathmandu Heights"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="prop-type"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="prop-type"
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as PropertyType)}
                    className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Operating Currency
                  </label>
                  <select
                    id="prop-currency"
                    value={propCurrency}
                    onChange={(e) => setPropCurrency(e.target.value as CurrencyCode)}
                    className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Street Address
                  </label>
                  <Input
                    id="prop-street"
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 10 Lazimpat"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prop-city"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    City
                  </label>
                  <Input
                    id="prop-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kathmandu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="prop-state"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    State/Province
                  </label>
                  <Input
                    id="prop-state"
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Bagmati"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prop-postal"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Postal Code
                  </label>
                  <Input
                    id="prop-postal"
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="44600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prop-country"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Country
                  </label>
                  <Input
                    id="prop-country"
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Add Property
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form 2: Add Rentable Space */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Add Rentable Unit / Space</CardTitle>
                <CardDescription className="text-xs">
                  Create a rentable residential unit or suite under an active property
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSpaceSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="target-property"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Select Property
                </label>
                <select
                  id="target-property"
                  value={selectedPropId || properties[0]?.id || ''}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                  <label
                    htmlFor="space-num"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Space # / Unit Label
                  </label>
                  <Input
                    id="space-num"
                    type="text"
                    required
                    value={spaceNumber}
                    onChange={(e) => setSpaceNumber(e.target.value)}
                    placeholder="e.g. Apt 101"
                  />
                </div>
                <div>
                  <label
                    htmlFor="space-block"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Building Block (Optional)
                  </label>
                  <Input
                    id="space-block"
                    type="text"
                    value={buildingBlock}
                    onChange={(e) => setBuildingBlock(e.target.value)}
                    placeholder="e.g. Tower A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="space-type"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Space Type
                  </label>
                  <select
                    id="space-type"
                    value={spaceType}
                    onChange={(e) => setSpaceType(e.target.value as SpaceType)}
                    className="flex h-11 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <option value="WHOLE_APARTMENT">Whole Apartment</option>
                    <option value="PRIVATE_ROOM">Private Room (Co-living)</option>
                    <option value="COMMERCIAL_SUITE">Commercial Suite</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="floor-level"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Floor Level
                  </label>
                  <Input
                    id="floor-level"
                    type="number"
                    required
                    value={floorLevel}
                    onChange={(e) => setFloorLevel(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="sqft"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Area (SqFt)
                  </label>
                  <Input
                    id="sqft"
                    type="number"
                    min={1}
                    required
                    value={floorAreaSqFt}
                    onChange={(e) => setFloorAreaSqFt(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label
                    htmlFor="max-occ"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Max Occupants
                  </label>
                  <Input
                    id="max-occ"
                    type="number"
                    min={1}
                    required
                    value={maxOccupants}
                    onChange={(e) => setMaxOccupants(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label
                    htmlFor="rent-minor"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Base Rent (Cents/Paisa)
                  </label>
                  <Input
                    id="rent-minor"
                    type="number"
                    min={0}
                    required
                    value={baseRentAmount}
                    onChange={(e) => setBaseRentAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={properties.length === 0}
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Space to Selected Property
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 3. Property Inventory List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Properties & Inventory Spaces
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live portfolio inventory across building blocks and rentable units
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {totalProperties} Properties | {totalUnits} Units
          </Badge>
        </div>

        {properties.length === 0 ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No properties added yet. Add your first property using the form above.
            </p>
          </Card>
        ) : (
          properties.map((property) => (
            <Card
              key={property.id}
              className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <CardHeader className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {property.name}
                      <Badge variant="outline" className="text-xs font-medium">
                        {property.currency}
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {property.propertyType}
                      </Badge>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {property.address.street}, {property.address.city}, {property.address.state}{' '}
                      {property.address.postalCode}, {property.address.country}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Total Units:{' '}
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {property.spaces.length}
                    </span>
                  </div>
                </div>
              </CardHeader>

              {/* Spaces Grid */}
              <CardContent className="p-4">
                {property.spaces.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic">
                    No units registered under this property yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {property.spaces.map((space) => (
                      <div
                        key={space.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-3.5 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {space.spaceNumber}
                              </div>
                              {space.buildingBlock && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {space.buildingBlock}
                                </div>
                              )}
                            </div>
                            {renderStatusBadge(space.status)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1">
                            <div>
                              Rent:{' '}
                              <span className="text-slate-900 dark:text-slate-200 font-semibold">
                                {formatRent(space.baseRentAmount, property.currency)}
                              </span>{' '}
                              / mo
                            </div>
                            <div>
                              Area: {space.floorAreaSqFt} sq ft | Max: {space.maxOccupants}{' '}
                              occupants
                            </div>
                            <div>Floor: Level {space.floorLevel}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                          {space.status !== 'MAINTENANCE' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                onUpdateSpaceStatus(property.id, space.id, 'MAINTENANCE')
                              }
                              className="text-xs text-amber-600 dark:text-amber-400 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            >
                              Mark Maintenance
                            </Button>
                          )}
                          {space.status !== 'VACANT' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateSpaceStatus(property.id, space.id, 'VACANT')}
                              className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                              Mark Vacant
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

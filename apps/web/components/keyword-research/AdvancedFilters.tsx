'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  RotateCcw,
  Search,
  Target,
  DollarSign,
  BarChart3,
  Globe,
  Languages
} from 'lucide-react';

export interface FilterState {
  searchTerm: string;
  minVolume: number;
  maxVolume: number;
  minDifficulty: number;
  maxDifficulty: number;
  minCpc: number;
  maxCpc: number;
  intent: string[];
  competition: string[];
  trend: string[];
  serpFeatures: string[];
  country: string;
  language: string;
  hasPosition: boolean;
  excludeKeywords: string[];
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const intentOptions = [
    { value: 'informational', label: 'Informational' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'navigational', label: 'Navigational' }
  ];

  const competitionOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const trendOptions = [
    { value: 'up', label: 'Rising' },
    { value: 'down', label: 'Declining' },
    { value: 'stable', label: 'Stable' }
  ];

  const serpFeatureOptions = [
    { value: 'featured_snippet', label: 'Featured Snippet' },
    { value: 'people_also_ask', label: 'People Also Ask' },
    { value: 'local_pack', label: 'Local Pack' },
    { value: 'shopping_results', label: 'Shopping Results' },
    { value: 'image_pack', label: 'Image Pack' },
    { value: 'video_results', label: 'Video Results' },
    { value: 'news_results', label: 'News Results' },
    { value: 'knowledge_panel', label: 'Knowledge Panel' }
  ];

  const countryOptions = [
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = localFilters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      searchTerm: '',
      minVolume: 0,
      maxVolume: 1000000,
      minDifficulty: 0,
      maxDifficulty: 100,
      minCpc: 0,
      maxCpc: 100,
      intent: [],
      competition: [],
      trend: [],
      serpFeatures: [],
      country: 'US',
      language: 'en',
      hasPosition: false,
      excludeKeywords: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.searchTerm) count++;
    if (localFilters.minVolume > 0) count++;
    if (localFilters.maxVolume < 1000000) count++;
    if (localFilters.minDifficulty > 0) count++;
    if (localFilters.maxDifficulty < 100) count++;
    if (localFilters.minCpc > 0) count++;
    if (localFilters.maxCpc < 100) count++;
    if (localFilters.intent.length > 0) count++;
    if (localFilters.competition.length > 0) count++;
    if (localFilters.trend.length > 0) count++;
    if (localFilters.serpFeatures.length > 0) count++;
    if (localFilters.hasPosition) count++;
    if (localFilters.excludeKeywords.length > 0) count++;
    return count;
  };

  if (isCollapsed) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg font-semibold">Advanced Filters</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Term */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Search Keywords
          </Label>
          <Input
            placeholder="Filter by keyword..."
            value={localFilters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
        </div>

        {/* Volume Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Search Volume Range
          </Label>
          <div className="px-2">
            <Slider
              value={[localFilters.minVolume, localFilters.maxVolume]}
              onValueChange={([min, max]) => {
                updateFilter('minVolume', min);
                updateFilter('maxVolume', max);
              }}
              max={1000000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{localFilters.minVolume.toLocaleString()}</span>
              <span>{localFilters.maxVolume.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Difficulty Range
          </Label>
          <div className="px-2">
            <Slider
              value={[localFilters.minDifficulty, localFilters.maxDifficulty]}
              onValueChange={([min, max]) => {
                updateFilter('minDifficulty', min);
                updateFilter('maxDifficulty', max);
              }}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{localFilters.minDifficulty}</span>
              <span>{localFilters.maxDifficulty}</span>
            </div>
          </div>
        </div>

        {/* CPC Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            CPC Range
          </Label>
          <div className="px-2">
            <Slider
              value={[localFilters.minCpc, localFilters.maxCpc]}
              onValueChange={([min, max]) => {
                updateFilter('minCpc', min);
                updateFilter('maxCpc', max);
              }}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${localFilters.minCpc}</span>
              <span>${localFilters.maxCpc}</span>
            </div>
          </div>
        </div>

        {/* Intent */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search Intent</Label>
          <div className="flex flex-wrap gap-2">
            {intentOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`intent-${option.value}`}
                  checked={localFilters.intent.includes(option.value)}
                  onCheckedChange={() => toggleArrayFilter('intent', option.value)}
                />
                <Label
                  htmlFor={`intent-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Competition */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Competition Level</Label>
          <div className="flex flex-wrap gap-2">
            {competitionOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`competition-${option.value}`}
                  checked={localFilters.competition.includes(option.value)}
                  onCheckedChange={() => toggleArrayFilter('competition', option.value)}
                />
                <Label
                  htmlFor={`competition-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* SERP Features */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">SERP Features</Label>
          <div className="grid grid-cols-2 gap-2">
            {serpFeatureOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`serp-${option.value}`}
                  checked={localFilters.serpFeatures.includes(option.value)}
                  onCheckedChange={() => toggleArrayFilter('serpFeatures', option.value)}
                />
                <Label
                  htmlFor={`serp-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Language */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Country
            </Label>
            <Select
              value={localFilters.country}
              onValueChange={(value) => updateFilter('country', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              Language
            </Label>
            <Select
              value={localFilters.language}
              onValueChange={(value) => updateFilter('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasPosition"
              checked={localFilters.hasPosition}
              onCheckedChange={(checked) => updateFilter('hasPosition', checked)}
            />
            <Label htmlFor="hasPosition" className="text-sm cursor-pointer">
              Only keywords with current rankings
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
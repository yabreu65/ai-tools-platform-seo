'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  X, 
  Loader2,
  Globe,
  Languages,
  Target,
  Lightbulb,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface SearchParams {
  seedKeywords: string[];
  country: string;
  language: string;
  includeRelated: boolean;
  includeLongTail: boolean;
  includeQuestions: boolean;
  includeCompetitors: boolean;
  minVolume: number;
  maxResults: number;
  competitorUrls: string[];
}

interface KeywordSearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  className?: string;
}

const KeywordSearch: React.FC<KeywordSearchProps> = ({
  onSearch,
  isLoading = false,
  className = ''
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    seedKeywords: [''],
    country: 'US',
    language: 'en',
    includeRelated: true,
    includeLongTail: true,
    includeQuestions: false,
    includeCompetitors: false,
    minVolume: 100,
    maxResults: 100,
    competitorUrls: ['']
  });

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

  const updateSearchParam = (key: keyof SearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const addKeyword = () => {
    setSearchParams(prev => ({
      ...prev,
      seedKeywords: [...prev.seedKeywords, '']
    }));
  };

  const removeKeyword = (index: number) => {
    setSearchParams(prev => ({
      ...prev,
      seedKeywords: prev.seedKeywords.filter((_, i) => i !== index)
    }));
  };

  const updateKeyword = (index: number, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      seedKeywords: prev.seedKeywords.map((keyword, i) => 
        i === index ? value : keyword
      )
    }));
  };

  const addCompetitorUrl = () => {
    setSearchParams(prev => ({
      ...prev,
      competitorUrls: [...prev.competitorUrls, '']
    }));
  };

  const removeCompetitorUrl = (index: number) => {
    setSearchParams(prev => ({
      ...prev,
      competitorUrls: prev.competitorUrls.filter((_, i) => i !== index)
    }));
  };

  const updateCompetitorUrl = (index: number, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      competitorUrls: prev.competitorUrls.map((url, i) => 
        i === index ? value : url
      )
    }));
  };

  const handleSearch = () => {
    const filteredParams = {
      ...searchParams,
      seedKeywords: searchParams.seedKeywords.filter(k => k.trim() !== ''),
      competitorUrls: searchParams.competitorUrls.filter(u => u.trim() !== '')
    };
    
    if (filteredParams.seedKeywords.length === 0) {
      return;
    }
    
    onSearch(filteredParams);
  };

  const getSearchTypesBadges = () => {
    const types = [];
    if (searchParams.includeRelated) types.push('Related');
    if (searchParams.includeLongTail) types.push('Long-tail');
    if (searchParams.includeQuestions) types.push('Questions');
    if (searchParams.includeCompetitors) types.push('Competitors');
    return types;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Keyword Discovery</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seed Keywords */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Seed Keywords *</Label>
          {searchParams.seedKeywords.map((keyword, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a keyword..."
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
                className="flex-1"
              />
              {searchParams.seedKeywords.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeKeyword(index)}
                  className="h-10 w-10 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addKeyword}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Keyword
          </Button>
        </div>

        {/* Location & Language */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Country
            </Label>
            <Select
              value={searchParams.country}
              onValueChange={(value) => updateSearchParam('country', value)}
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
              value={searchParams.language}
              onValueChange={(value) => updateSearchParam('language', value)}
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

        {/* Search Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Search Types</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRelated"
                checked={searchParams.includeRelated}
                onCheckedChange={(checked) => updateSearchParam('includeRelated', checked)}
              />
              <Label htmlFor="includeRelated" className="text-sm cursor-pointer flex items-center">
                <Lightbulb className="h-4 w-4 mr-1" />
                Related Keywords
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeLongTail"
                checked={searchParams.includeLongTail}
                onCheckedChange={(checked) => updateSearchParam('includeLongTail', checked)}
              />
              <Label htmlFor="includeLongTail" className="text-sm cursor-pointer flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Long-tail Keywords
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeQuestions"
                checked={searchParams.includeQuestions}
                onCheckedChange={(checked) => updateSearchParam('includeQuestions', checked)}
              />
              <Label htmlFor="includeQuestions" className="text-sm cursor-pointer flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                Question Keywords
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCompetitors"
                checked={searchParams.includeCompetitors}
                onCheckedChange={(checked) => updateSearchParam('includeCompetitors', checked)}
              />
              <Label htmlFor="includeCompetitors" className="text-sm cursor-pointer flex items-center">
                <Target className="h-4 w-4 mr-1" />
                Competitor Analysis
              </Label>
            </div>
          </div>
          
          {getSearchTypesBadges().length > 0 && (
            <div className="flex flex-wrap gap-1">
              {getSearchTypesBadges().map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Competitor URLs */}
        {searchParams.includeCompetitors && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Competitor URLs</Label>
            {searchParams.competitorUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder="https://competitor.com"
                  value={url}
                  onChange={(e) => updateCompetitorUrl(index, e.target.value)}
                  className="flex-1"
                />
                {searchParams.competitorUrls.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCompetitorUrl(index)}
                    className="h-10 w-10 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addCompetitorUrl}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor URL
            </Button>
          </div>
        )}

        {/* Advanced Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Min. Search Volume</Label>
            <Select
              value={searchParams.minVolume.toString()}
              onValueChange={(value) => updateSearchParam('minVolume', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any volume</SelectItem>
                <SelectItem value="10">10+</SelectItem>
                <SelectItem value="100">100+</SelectItem>
                <SelectItem value="500">500+</SelectItem>
                <SelectItem value="1000">1,000+</SelectItem>
                <SelectItem value="5000">5,000+</SelectItem>
                <SelectItem value="10000">10,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Results</Label>
            <Select
              value={searchParams.maxResults.toString()}
              onValueChange={(value) => updateSearchParam('maxResults', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 keywords</SelectItem>
                <SelectItem value="100">100 keywords</SelectItem>
                <SelectItem value="200">200 keywords</SelectItem>
                <SelectItem value="500">500 keywords</SelectItem>
                <SelectItem value="1000">1,000 keywords</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={isLoading || searchParams.seedKeywords.filter(k => k.trim()).length === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching Keywords...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Discover Keywords
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KeywordSearch;
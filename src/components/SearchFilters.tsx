"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<number[]>([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '100000000'),
  ]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 100000000) params.set('maxPrice', priceRange[1].toString());
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setPriceRange([0, 100000000]);
    router.push('/');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            جستجو و فیلتر
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>جستجو</Label>
              <Input
                placeholder="جستجو در آگهی‌ها..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="همه دسته‌بندی‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه دسته‌بندی‌ها</SelectItem>
                  {/* Categories will be loaded from database */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>محدوده قیمت</Label>
              <div className="space-y-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100000000}
                  min={0}
                  step={1000000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0].toLocaleString()} تومان</span>
                  <span>{priceRange[1].toLocaleString()} تومان</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              جستجو
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              پاک کردن
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}


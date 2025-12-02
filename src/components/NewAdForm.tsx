"use client";

import { createSupabaseClientComponentClient } from "../lib/supabase-client";
import { useState, useRef } from "react";
import { Category } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2, MapPin, DollarSign, FileText, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewAdFormProps {
  categories: Category[];
}

export default function NewAdForm({ categories }: NewAdFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'free'>('negotiable');
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "خطا",
          description: "فقط فایل‌های تصویری مجاز هستند.",
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطا",
          description: "حجم هر تصویر نباید بیشتر از ۵ مگابایت باشد.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 10) {
      toast({
        title: "خطا",
        description: "حداکثر ۱۰ تصویر می‌توانید آپلود کنید.",
        variant: "destructive",
      });
      return;
    }

    setImages([...images, ...validFiles]);
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setImageUrls([...imageUrls, url]);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setImageUrls(newUrls);
    URL.revokeObjectURL(imageUrls[index]);
  };

  const uploadImages = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا وارد حساب کاربری خود شوید.",
        variant: "destructive",
      });
      setLoading(false);
      router.push('/login');
      return;
    }

    // Validation
    if (!title || !description || !categoryId || !location) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای الزامی را پر کنید.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Upload images
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        uploadedImageUrls = await uploadImages(user.id);
        setUploading(false);
      }

      // Create ad
      const newAd = {
        title,
        description,
        price: price ? parseFloat(price) : null,
        price_type: priceType,
        category_id: categoryId,
        subcategory_id: subcategoryId || null,
        user_id: user.id,
        location,
        city: city || null,
        province: province || null,
        images: uploadedImageUrls,
        contact_info: {
          phone: phone || null,
          telegram: telegram || null,
          whatsapp: whatsapp || null,
        },
        status: 'active',
      };

      const { data, error } = await supabase.from('ads').insert([newAd]).select().single();

      if (error) {
        throw error;
      }

      toast({
        title: "موفقیت",
        description: "آگهی شما با موفقیت ثبت شد!",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setSubcategoryId("");
      setLocation("");
      setCity("");
      setProvince("");
      setPhone("");
      setTelegram("");
      setWhatsapp("");
      setImages([]);
      setImageUrls([]);
      imageUrls.forEach(url => URL.revokeObjectURL(url));

      // Redirect to ad page
      router.push(`/ads/${data.id}`);
    } catch (err: any) {
      toast({
        title: "خطا",
        description: err.message || "خطایی در ثبت آگهی رخ داد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const subcategories = selectedCategory?.parent_id 
    ? categories.filter(c => c.parent_id === selectedCategory.id)
    : categories.filter(c => c.parent_id === categoryId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">ثبت آگهی جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                عنوان آگهی <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: فروش آپارتمان ۱۰۰ متری در تهران"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                توضیحات <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="توضیحات کامل آگهی را اینجا بنویسید..."
                required
                disabled={loading}
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  قیمت (تومان)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="مثال: 50000000"
                  disabled={loading || priceType === 'free'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceType">نوع قیمت</Label>
                <select
                  id="priceType"
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading}
                >
                  <option value="negotiable">قابل مذاکره</option>
                  <option value="fixed">ثابت</option>
                  <option value="free">رایگان</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  دسته‌بندی <span className="text-destructive">*</span>
                </Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId("");
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={loading}
                >
                  <option value="">انتخاب کنید</option>
                  {categories.filter(c => !c.parent_id).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">زیردسته</Label>
                  <select
                    id="subcategory"
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                  >
                    <option value="">انتخاب کنید</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  آدرس <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="آدرس کامل"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">شهر</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="شهر"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">استان</Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="استان"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <Label>اطلاعات تماس</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">تلگرام</Label>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">واتساپ</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="09123456789"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                تصاویر (حداکثر ۱۰ تصویر)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading || uploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading || images.length >= 10}
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "در حال آپلود..." : "انتخاب تصاویر"}
              </Button>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "در حال آپلود تصاویر..." : "در حال ثبت..."}
                </>
              ) : (
                "ثبت آگهی"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

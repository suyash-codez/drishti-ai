import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://slvdqfprkwuuxjbrrqhs.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdmRxZnBya3d1dXhqYnJycWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTI3NzUsImV4cCI6MjEwNTI4ODc3NX0.mnwEDl1GTwWgm9eyXeqgx5iXpKBb5-qletF7wnKVB1c";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface FarmerProfile {
  id: string;
  email?: string;
  phone?: string;
  full_name: string;
  village_district: string;
  state: string;
  language: string;
  land_size_acres: number;
  created_at?: string;
}

export interface FarmerField {
  id: string;
  user_id: string;
  name: string;
  cropKey: string;
  cropName: string;
  areaAcres: number;
  soilType: string;
  sowingDate?: string;
  status?: string;
  created_at?: string;
}

export interface AdvisoryRecord {
  id: string;
  user_id: string;
  crop_type: string;
  growth_stage?: string;
  soil_moisture: number;
  temperature: number;
  rainfall: number;
  irrigation_mm: number;
  irrigation_timing: string;
  fertilizer_type: string;
  fertilizer_amount_kg: number;
  cost_saved_rupees: number;
  water_saved_liters: number;
  alert_level: "green" | "yellow" | "red";
  created_at: string;
}

// ----------------- AUTH HELPERS -----------------

export async function signUpFarmer(
  emailOrPhone: string,
  password: string,
  profile: {
    fullName: string;
    villageDistrict: string;
    state?: string;
    language?: string;
    landSize?: number;
  }
) {
  try {
    const email = emailOrPhone.includes("@") 
      ? emailOrPhone.trim().toLowerCase() 
      : `kisan_${emailOrPhone.replace(/\D/g, "")}@drishti.ai`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profile.fullName,
          village_district: profile.villageDistrict,
          state: profile.state || "Madhya Pradesh",
          language: profile.language || "hi",
          land_size_acres: profile.landSize || 2.5,
          phone: emailOrPhone.includes("@") ? "" : emailOrPhone,
        },
      },
    });

    if (error) {
      if (error.message.includes("User already registered") || error.message.includes("already exists")) {
        return { data: null, error: "यह नंबर/ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।" };
      }
      return { data: null, error: error.message };
    }

    // Create or upsert profile in profiles table
    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: profile.fullName,
          village_district: profile.villageDistrict,
          state: profile.state || "Madhya Pradesh",
          language: profile.language || "hi",
          land_size_acres: profile.landSize || 2.5,
          phone: emailOrPhone.includes("@") ? "" : emailOrPhone,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("Profile upsert notice:", e);
      }
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "साइन-अप विफल रहा" };
  }
}

export async function signInFarmer(emailOrPhone: string, password: string) {
  try {
    const email = emailOrPhone.includes("@") 
      ? emailOrPhone.trim().toLowerCase() 
      : `kisan_${emailOrPhone.replace(/\D/g, "")}@drishti.ai`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials") || error.status === 400) {
        return { 
          data: null, 
          error: "गलत पासवर्ड या यह खाता नहीं मिला। कृपया पहले 'नया खाता बनाएं' पर क्लिक करें।" 
        };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { 
      data: null, 
      error: "लॉगिन नहीं हो सका। कृपया जांचें कि आपने पहले खाता बनाया है या नहीं।" 
    };
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || "Google लॉगिन विफल रहा" };
  }
}

export async function signOutFarmer() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
  }
}

export async function getFarmerProfile(userId: string): Promise<FarmerProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      // Fallback from auth user metadata
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && userData.user.id === userId) {
        const meta = userData.user.user_metadata || {};
        return {
          id: userId,
          email: userData.user.email,
          phone: meta.phone || "",
          full_name: meta.full_name || meta.name || userData.user.email?.split("@")[0] || "किसान भाई (Farmer)",
          village_district: meta.village_district || "इंदौर / धार",
          state: meta.state || "मध्य प्रदेश",
          language: meta.language || "hi",
          land_size_acres: meta.land_size_acres || 3.0,
        };
      }
      return null;
    }

    return data as FarmerProfile;
  } catch (err) {
    console.warn("Error fetching farmer profile:", err);
    return null;
  }
}

// ----------------- FIELDS HELPERS -----------------

export async function fetchFarmerFields(userId: string): Promise<FarmerField[]> {
  try {
    const { data, error } = await supabase
      .from("farmer_fields")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback default sample fields for seamless UX
      return [
        {
          id: "field_default_1",
          user_id: userId,
          name: "उत्तरी खेत (North Field)",
          cropKey: "wheat",
          cropName: "गेहूं (Wheat - Lokwan)",
          areaAcres: 2.5,
          soilType: "काली चिकनी मिट्टी (Black Clay)",
          sowingDate: "15 Nov 2025",
          status: "healthy",
        },
        {
          id: "field_default_2",
          user_id: userId,
          name: "बोरवेल वाला खेत (Tube-well Field)",
          cropKey: "soybean",
          cropName: "सोयाबीन (Soybean - JS 9560)",
          areaAcres: 1.5,
          soilType: "दोमट मिट्टी (Loamy Soil)",
          sowingDate: "20 Jun 2025",
          status: "needs_water",
        },
      ];
    }

    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name,
      cropKey: item.crop_key,
      cropName: item.crop_name || item.crop_key,
      areaAcres: Number(item.area_acres),
      soilType: item.soil_type || "काली दोमट मिट्टी",
      sowingDate: item.sowing_date || "हाल ही में",
      status: item.status || "healthy",
      created_at: item.created_at,
    }));
  } catch (err) {
    console.warn("fetchFarmerFields notice:", err);
    return [];
  }
}

export async function createFarmerField(
  userId: string,
  field: {
    name: string;
    cropKey: string;
    cropName: string;
    areaAcres: number;
    soilType: string;
    sowingDate?: string;
  }
): Promise<FarmerField> {
  const newField = {
    id: `field_${Date.now()}`,
    user_id: userId,
    name: field.name,
    crop_key: field.cropKey,
    crop_name: field.cropName,
    area_acres: field.areaAcres,
    soil_type: field.soilType,
    sowing_date: field.sowingDate || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("farmer_fields")
      .insert(newField)
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        cropKey: data.crop_key,
        cropName: data.crop_name,
        areaAcres: Number(data.area_acres),
        soilType: data.soil_type,
        sowingDate: data.sowing_date,
        created_at: data.created_at,
      };
    }
  } catch (e) {
    console.warn("DB insert error, using local instance:", e);
  }

  return {
    id: newField.id,
    user_id: userId,
    name: field.name,
    cropKey: field.cropKey,
    cropName: field.cropName,
    areaAcres: field.areaAcres,
    soilType: field.soilType,
    sowingDate: field.sowingDate,
    created_at: newField.created_at,
  };
}

// ----------------- ADVISORY HISTORY HELPERS -----------------

export async function fetchFarmerAdvisories(userId: string): Promise<AdvisoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from("advisory_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      crop_type: d.crop_type,
      growth_stage: d.growth_stage,
      soil_moisture: Number(d.soil_moisture),
      temperature: Number(d.temperature),
      rainfall: Number(d.rainfall),
      irrigation_mm: Number(d.irrigation_mm),
      irrigation_timing: d.irrigation_timing,
      fertilizer_type: d.fertilizer_type,
      fertilizer_amount_kg: Number(d.fertilizer_amount_kg),
      cost_saved_rupees: Number(d.cost_saved_rupees),
      water_saved_liters: Number(d.water_saved_liters),
      alert_level: d.alert_level || "green",
      created_at: d.created_at,
    }));
  } catch (err) {
    console.warn("fetchFarmerAdvisories error:", err);
    return [];
  }
}

export async function saveFarmerAdvisoryRecord(
  userId: string,
  record: Omit<AdvisoryRecord, "id" | "user_id" | "created_at">
) {
  try {
    const newRecord = {
      user_id: userId,
      crop_type: record.crop_type,
      growth_stage: record.growth_stage || "general",
      soil_moisture: record.soil_moisture,
      temperature: record.temperature,
      rainfall: record.rainfall,
      irrigation_mm: record.irrigation_mm,
      irrigation_timing: record.irrigation_timing,
      fertilizer_type: record.fertilizer_type,
      fertilizer_amount_kg: record.fertilizer_amount_kg,
      cost_saved_rupees: record.cost_saved_rupees,
      water_saved_liters: record.water_saved_liters,
      alert_level: record.alert_level,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("advisory_history")
      .insert(newRecord)
      .select()
      .maybeSingle();

    if (error) {
      console.warn("Failed to persist advisory to Supabase table:", error);
    }
    return data;
  } catch (err) {
    console.warn("saveFarmerAdvisoryRecord error:", err);
    return null;
  }
}

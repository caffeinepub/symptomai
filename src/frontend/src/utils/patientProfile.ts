export interface PatientProfile {
  name: string;
  gender: string;
  age: string;
}

const PROFILE_KEY_PREFIX = "synapse_profile_";

export function savePatientProfile(
  principalId: string,
  profile: PatientProfile,
): void {
  try {
    const key = `${PROFILE_KEY_PREFIX}${principalId}`;
    localStorage.setItem(key, JSON.stringify(profile));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function getPatientProfile(principalId: string): PatientProfile | null {
  try {
    const key = `${PROFILE_KEY_PREFIX}${principalId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "name" in parsed &&
      "gender" in parsed &&
      "age" in parsed
    ) {
      return parsed as PatientProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPatientProfile(principalId: string): void {
  try {
    const key = `${PROFILE_KEY_PREFIX}${principalId}`;
    localStorage.removeItem(key);
  } catch {
    // localStorage may be unavailable
  }
}

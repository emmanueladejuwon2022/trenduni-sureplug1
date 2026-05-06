import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Store, Loader2, UploadCloud } from 'lucide-react';
import { api } from '../services/api';

interface OnboardingProps {
  onComplete: () => void;
  user: any;
}

export default function Onboarding({ onComplete, user }: OnboardingProps) {
  const [role, setRole] = useState<'user' | 'vendor' | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Shared fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [faculty, setFaculty] = useState('');
  const [biodataUrl, setBiodataUrl] = useState(''); // Mocked upload

  // Customer specific
  const [otherPhoneNumber, setOtherPhoneNumber] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Vendor specific
  const [nin, setNin] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [hasHostel, setHasHostel] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;

    // Strict validation for matric number
    if (!/^\d{9}$/.test(matricNumber)) {
      alert('Matric number must be exactly 9 digits (e.g., 240811024)');
      return;
    }

    setLoading(true);
    try {
      const userData: any = {
        id: user.id,
        email: user.email,
        role,
        name: fullName,
        phoneNumber,
        matricNumber,
        department,
        faculty,
        biodataUrl,
        walletBalance: "0",
        isVerified: false
      };

      if (role === 'user') {
        userData.otherPhoneNumber = otherPhoneNumber;
        userData.parentPhoneNumber = parentPhoneNumber;
        userData.gender = gender;
        userData.photoUrl = photoUrl;
      } else {
        userData.nin = nin;
        userData.homeAddress = homeAddress;
        userData.hasHostel = hasHostel;
      }

      // In Postgres setup, users are created at auth/register if we wanted, 
      // but here we might be creating the detailed profile.
      // We use users.update since the base user record exists from register.
      await api.users.update(user.id, userData);
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs for visual interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="max-w-3xl w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Choose Your Path</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Welcome to SurePlug. How do you plan to use the platform today? You can always change this later.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setRole('user')}
              className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-start text-left overflow-hidden border border-slate-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500">
                <User className="text-indigo-600 group-hover:text-white transition-colors duration-500" size={40} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">I am a Customer</h3>
                <p className="text-slate-500 leading-relaxed">
                  I want to discover items, request campus services, and securely collaborate with top vendors.
                </p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setRole('vendor')}
              className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-start text-left overflow-hidden border border-slate-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-20 h-20 rounded-2xl bg-fuchsia-50 flex items-center justify-center flex-shrink-0 mb-6 group-hover:scale-110 group-hover:bg-fuchsia-600 transition-all duration-500">
                <Store className="text-fuchsia-600 group-hover:text-white transition-colors duration-500" size={40} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">I am a Vendor</h3>
                <p className="text-slate-500 leading-relaxed">
                  I want to set up shop, showcase my services, and start earning from the campus community.
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 relative z-10"
      >
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/30 to-transparent pointer-events-none"></div>
          <h2 className="text-3xl font-extrabold tracking-tight relative z-10">Complete Your Profile</h2>
          <p className="text-slate-400 mt-2 relative z-10 text-lg">
            {role === 'vendor' ? 'Vendor Registration details' : 'Customer Registration details'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Shared Fields */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                <input required type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Academic Information</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Matric Number *</label>
              <input required type="text" placeholder="e.g. 240811024" value={matricNumber} onChange={e => setMatricNumber(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
              <p className="text-xs text-slate-500 mt-2">Must be exactly 9 digits.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Faculty *</label>
                <div className="relative">
                  <select required value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white appearance-none">
                    <option value="">Select...</option>
                    <option value="Arts">Arts</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Science">Science</option>
                    <option value="Social Sciences">Social Sciences</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                <input required type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Biodata Form (PDF) {role === 'vendor' ? '*' : ''}</label>
            <div className="w-full relative border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 transition-all group overflow-hidden">
              <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setBiodataUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud size={32} className="mb-3 group-hover:-translate-y-1 transition-transform" />
              <span className="font-semibold">{biodataUrl ? 'File Selected' : 'Click to Upload PDF'}</span>
            </div>
          </div>

          {/* Customer Specific Fields */}
          {role === 'user' && (
            <div className="space-y-6 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Other Phone Number</label>
                  <input type="tel" value={otherPhoneNumber} onChange={e => setOtherPhoneNumber(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Parent Phone *</label>
                  <input required type="tel" value={parentPhoneNumber} onChange={e => setParentPhoneNumber(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                  <div className="relative">
                    <select required value={gender} onChange={e => setGender(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white appearance-none">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Photo *</label>
                  <div className={`w-full relative p-4 rounded-xl border font-semibold transition-all flex items-center justify-center gap-2 overflow-hidden cursor-pointer ${photoUrl ? 'bg-green-50 text-green-700 border-green-200' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-400 hover:text-indigo-600'}`}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setPhotoUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <UploadCloud size={20} />
                    {photoUrl ? 'Photo Complete' : 'Upload Photo'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Specific Fields */}
          {role === 'vendor' && (
            <div className="space-y-6 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">NIN Number *</label>
                  <input required type="text" value={nin} onChange={e => setNin(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Home Address *</label>
                <textarea required value={homeAddress} onChange={e => setHomeAddress(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 hover:bg-slate-100 focus:bg-white resize-y" rows={3} />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setHasHostel(!hasHostel)}>
                <input type="checkbox" id="hostel" checked={hasHostel} readOnly className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 pointer-events-none" />
                <label htmlFor="hostel" className="text-slate-800 font-semibold cursor-pointer">I have a hostel in UNILAG</label>
              </div>
            </div>
          )}

          <div className="pt-8">
            <button
              type="submit"
              disabled={loading || !biodataUrl || (role === 'user' && !photoUrl)}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 px-8 rounded-2xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Complete Registration'}
            </button>
            <p className="text-sm text-center text-slate-500 mt-6 font-medium">
              By registering, you agree to our strict verification policies.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

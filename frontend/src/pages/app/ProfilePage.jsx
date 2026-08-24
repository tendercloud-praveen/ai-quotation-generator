// import { useState, useRef } from 'react';
// import { UserCircle, Mail, Phone, Building2, Shield, Save, Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
// import PageHeader from '../../components/PageHeader';
// import Breadcrumbs from '../../components/Breadcrumbs';
// import { Card, CardHeader, CardBody } from '../../components/Card';
// import Button from '../../components/Button';
// import Modal from '../../components/Modal';
// import { Input } from '../../components/Field';
// import Avatar from '../../components/Avatar';
// import Badge from '../../components/Badge';
// import { useToast } from '../../components/Toast';
// import { useRole } from '../../lib/RoleContext';
// import { updateUser } from '../../lib/users';
// import { validateMobile } from '../../lib/validate';
// import { ROLE_LABELS } from '../../lib/nav';
// import { useStore } from '../../lib/useStore';

// const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
// const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

// function resizeImage(file, maxSize = 256) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         let { width, height } = img;
//         if (width > height) { if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; } }
//         else { if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; } }
//         canvas.width = width; canvas.height = height;
//         canvas.getContext('2d').drawImage(img, 0, 0, width, height);
//         resolve(canvas.toDataURL('image/jpeg', 0.85));
//       };
//       img.onerror = reject;
//       img.src = e.target.result;
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// export default function ProfilePage() {
//   useStore(() => {});
//   const { user } = useRole();
//   const toast = useToast();
//   const [form, setForm] = useState({ fullName: user?.fullName || '', mobile: user?.mobile || '', companyName: user?.companyName || '' });
//   const [errors, setErrors] = useState({});
//   const [photoOpen, setPhotoOpen] = useState(false);
//   const cameraRef = useRef(null);
//   const fileRef = useRef(null);

//   const pickFile = async (f) => {
//     if (!f) return;
//     if (!ACCEPTED.includes(f.type)) { toast.error('Only JPG, PNG, or WebP images are allowed.'); return; }
//     if (f.size > MAX_AVATAR_SIZE) { toast.error('Image is too large (max 2MB).'); return; }
//     try {
//       const dataUrl = await resizeImage(f);
//       updateUser(user.id, { avatarImage: dataUrl });
//       toast.success('Profile photo updated.');
//       setPhotoOpen(false);
//     } catch {
//       toast.error('Could not process the image.');
//     }
//   };

//   const removePhoto = () => {
//     updateUser(user.id, { avatarImage: null });
//     toast.success('Profile photo removed.');
//     setPhotoOpen(false);
//   };

//   const save = () => {
//     const e = {};
//     if (!form.fullName.trim()) e.fullName = 'Name is required';
//     if (!form.mobile.trim()) e.mobile = 'Mobile is required';
//     else if (!validateMobile(form.mobile)) e.mobile = 'Must be 10 digits';
//     setErrors(e);
//     if (Object.keys(e).length) return;
//     updateUser(user.id, { fullName: form.fullName, mobile: form.mobile });
//     toast.success('Profile updated successfully.');
//   };

//   return (
//     <div className="space-y-6">
//       <Breadcrumbs items={[{ label: 'Profile' }]} />
//       <PageHeader title="My Profile" subtitle="Manage your personal information and account details." />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Profile card */}
//         <Card className="lg:col-span-1">
//           <CardBody className="flex flex-col items-center text-center py-8">
//             <div className="relative group">
//               <Avatar name={user?.fullName} color={user?.avatarColor} size={96} src={user?.avatarImage} />
//               <button
//                 onClick={() => setPhotoOpen(true)}
//                 className="absolute bottom-0 right-0 grid place-items-center h-8 w-8 rounded-full bg-brand-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-md hover:bg-brand-700 transition"
//                 title="Change photo"
//               >
//                 <Camera size={16} />
//               </button>
//             </div>
//             <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">{user?.fullName}</h3>
//             <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
//             <div className="mt-3"><Badge tone={user?.role === 'admin' ? 'brand' : user?.role === 'manager' ? 'info' : 'default'} dot>{ROLE_LABELS[user?.role]}</Badge></div>
//             <div className="mt-6 w-full space-y-3 text-left">
//               <div className="flex items-center gap-3 text-sm">
//                 <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400"><Building2 size={16} /></div>
//                 <span className="text-slate-600 dark:text-slate-300">{user?.companyName}</span>
//               </div>
//               <div className="flex items-center gap-3 text-sm">
//                 <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400"><Mail size={16} /></div>
//                 <span className="text-slate-600 dark:text-slate-300">{user?.email}</span>
//               </div>
//               <div className="flex items-center gap-3 text-sm">
//                 <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400"><Phone size={16} /></div>
//                 <span className="text-slate-600 dark:text-slate-300">{user?.mobile}</span>
//               </div>
//             </div>
//           </CardBody>
//         </Card>

//         {/* Edit form */}
//         <div className="lg:col-span-2 space-y-6">
//           <Card>
//             <CardHeader title="Personal Information" subtitle="Update your name and contact details" icon={UserCircle} />
//             <CardBody className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={errors.fullName} />
//                 <Input label="Mobile" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} error={errors.mobile} />
//                 <Input label="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} disabled />
//                 <Input label="Email" value={user?.email} disabled />
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={save}><Save size={16} /> Save Changes</Button>
//               </div>
//             </CardBody>
//           </Card>

//           <Card>
//             <CardHeader title="Role & Permissions" subtitle="Your access level in the system" icon={Shield} />
//             <CardBody>
//               <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
//                 <div>
//                   <p className="font-semibold text-slate-700 dark:text-slate-200">{ROLE_LABELS[user?.role]}</p>
//                   <p className="text-sm text-slate-400 mt-0.5">
//                     {user?.role === 'admin' && 'Full access to all modules, users, and settings.'}
//                     {user?.role === 'manager' && 'Approve quotations, view reports, manage approvals.'}
//                     {user?.role === 'sales_rep' && 'Create inquiries, generate quotations, track status.'}
//                   </p>
//                 </div>
//                 <Badge tone="brand">{ROLE_LABELS[user?.role]}</Badge>
//               </div>
//             </CardBody>
//           </Card>
//         </div>
//       </div>

//       {/* Photo upload modal */}
//       <Modal open={photoOpen} onClose={() => setPhotoOpen(false)} title="Profile Photo" subtitle="Upload from device or take a photo" size="sm" footer={
//         <Button variant="secondary" onClick={() => setPhotoOpen(false)} className="w-full sm:w-auto">Close</Button>
//       }>
//         <div className="space-y-3">
//           <button
//             onClick={() => cameraRef.current?.click()}
//             className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
//           >
//             <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400"><Camera size={22} /></div>
//             <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Take Photo</p><p className="text-xs text-slate-400">Use your device camera</p></div>
//           </button>
//           <button
//             onClick={() => fileRef.current?.click()}
//             className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
//           >
//             <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"><ImageIcon size={22} /></div>
//             <div><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upload from Device</p><p className="text-xs text-slate-400">JPG, PNG or WebP (max 2MB)</p></div>
//           </button>
//           {user?.avatarImage && (
//             <button
//               onClick={removePhoto}
//               className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50/40 dark:hover:bg-red-950/30 transition text-left"
//             >
//               <div className="grid place-items-center h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"><Trash2 size={22} /></div>
//               <div><p className="text-sm font-semibold text-red-600 dark:text-red-400">Remove Photo</p><p className="text-xs text-slate-400">Revert to initials avatar</p></div>
//             </button>
//           )}
//         </div>
//         <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }} />
//         <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }} />
//       </Modal>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  Building2,
  Shield,
  Save,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card, CardHeader, CardBody } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Input } from "../../components/Field";
import Avatar from "../../components/Avatar";
import Badge from "../../components/Badge";
import { useToast } from "../../components/Toast";

import { useRole } from "../../lib/RoleContext";
import { updateUser } from "../../lib/users";
import { validateMobile } from "../../lib/validate";
import { ROLE_LABELS } from "../../lib/nav";
import { useStore } from "../../lib/useStore";

import { getUserByIdApi } from "../../services/userService";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function resizeImage(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  useStore(() => {});

  const { user } = useRole();

  const toast = useToast();

  /*
   * Backend user
   */
  const [profileUser, setProfileUser] = useState(user);

  /*
   * Existing form
   */
  const [form, setForm] = useState({
    fullName: user?.fullName || "",

    mobile: user?.mobile || "",

    companyName: user?.companyName || "",
  });

  const [errors, setErrors] = useState({});

  const [photoOpen, setPhotoOpen] = useState(false);

  const cameraRef = useRef(null);

  const fileRef = useRef(null);

  /*
   * Get complete user details
   * from backend
   */
  useEffect(() => {
    const loadUser = async () => {
      const userId = user?.id || user?.user_id;

      if (!userId) {
        return;
      }

      try {
        const response = await getUserByIdApi(userId);

        console.log("GET USER BY ID RESPONSE:", response);

        /*
         * Backend response:
         *
         * {
         *   message: "...",
         *   data: {
         *     id: 1,
         *     full_name: "Bhargava",
         *     email: "...",
         *     mobile_number: "...",
         *     role: "ADMIN",
         *     is_active: true
         *   }
         * }
         */
        const userData = response?.data || {};

        setProfileUser(userData);

        setForm({
          fullName: userData?.full_name || "",

          mobile: userData?.mobile_number || "",

          companyName: userData?.company_name || "",
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    loadUser();
  }, [user?.id, user?.user_id]);

  /*
   * Backend role
   *
   * Backend returns ADMIN,
   * while frontend uses admin.
   */
  const profileRole = (
    profileUser?.role ||
    profileUser?.user_role ||
    user?.role ||
    ""
  ).toLowerCase();

  /*
   * Profile values
   */
  const profileFullName = profileUser?.full_name || "";

  const profileEmail = profileUser?.email || "";

  const profileMobile = profileUser?.mobile_number || "";

  const profileCompany = profileUser?.company_name || "";

  const profileAvatar =
    profileUser?.avatarImage || profileUser?.avatar_image || null;

  const profileAvatarColor =
    profileUser?.avatarColor || profileUser?.avatar_color;

  /*
   * Profile photo
   */
  const pickFile = async (f) => {
    if (!f) {
      return;
    }

    if (!ACCEPTED.includes(f.type)) {
      toast.error("Only JPG, PNG, or WebP images are allowed.");

      return;
    }

    if (f.size > MAX_AVATAR_SIZE) {
      toast.error("Image is too large (max 2MB).");

      return;
    }

    try {
      const dataUrl = await resizeImage(f);

      updateUser(user.id, {
        avatarImage: dataUrl,
      });

      setProfileUser((previous) => ({
        ...(previous || {}),
        avatarImage: dataUrl,
      }));

      toast.success("Profile photo updated.");

      setPhotoOpen(false);
    } catch {
      toast.error("Could not process the image.");
    }
  };

  /*
   * Remove photo
   */
  const removePhoto = () => {
    updateUser(user.id, {
      avatarImage: null,
    });

    setProfileUser((previous) => ({
      ...(previous || {}),
      avatarImage: null,
    }));

    toast.success("Profile photo removed.");

    setPhotoOpen(false);
  };

  /*
   * Save profile
   */
  const save = () => {
    const e = {};

    if (!form.fullName.trim()) {
      e.fullName = "Name is required";
    }

    if (!form.mobile.trim()) {
      e.mobile = "Mobile is required";
    } else if (!validateMobile(form.mobile)) {
      e.mobile = "Must be 10 digits";
    }

    setErrors(e);

    if (Object.keys(e).length) {
      return;
    }

    updateUser(user.id, {
      fullName: form.fullName,

      mobile: form.mobile,
    });

    setProfileUser((previous) => ({
      ...(previous || {}),

      full_name: form.fullName,

      mobile_number: form.mobile,
    }));

    toast.success("Profile updated successfully.");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          {
            label: "Profile",
          },
        ]}
      />

      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and account details."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}

        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center py-8">
            <div className="relative group">
              <Avatar
                name={profileFullName}
                color={profileAvatarColor}
                size={96}
                src={profileAvatar}
              />

              <button
                onClick={() => setPhotoOpen(true)}
                className="absolute bottom-0 right-0 grid place-items-center h-8 w-8 rounded-full bg-brand-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-md hover:bg-brand-700 transition"
                title="Change photo"
              >
                <Camera size={16} />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
              {profileFullName}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {profileEmail}
            </p>

            <div className="mt-3">
              <Badge
                tone={
                  profileRole === "admin"
                    ? "brand"
                    : profileRole === "manager"
                      ? "info"
                      : "default"
                }
                dot
              >
                {ROLE_LABELS[profileRole] || profileRole}
              </Badge>
            </div>

            <div className="mt-6 w-full space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Building2 size={16} />
                </div>

                <span className="text-slate-600 dark:text-slate-300">
                  {profileCompany}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Mail size={16} />
                </div>

                <span className="text-slate-600 dark:text-slate-300">
                  {profileEmail}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Phone size={16} />
                </div>

                <span className="text-slate-600 dark:text-slate-300">
                  {profileMobile}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Right side */}

        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}

          <Card>
            <CardHeader
              title="Personal Information"
              subtitle="Update your name and contact details"
              icon={UserCircle}
            />

            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullName: e.target.value,
                    })
                  }
                  error={errors.fullName}
                />

                <Input
                  label="Mobile"
                  maxLength={10}
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  error={errors.mobile}
                />

                <Input
                  label="Company Name"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      companyName: e.target.value,
                    })
                  }
                  disabled
                />

                <Input label="Email" value={profileEmail} disabled />
              </div>

              <div className="flex justify-end">
                <Button onClick={save}>
                  <Save size={16} />
                  Save Changes
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Role & Permissions */}

          <Card>
            <CardHeader
              title="Role & Permissions"
              subtitle="Your access level in the system"
              icon={Shield}
            />

            <CardBody>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {ROLE_LABELS[profileRole] || profileRole}
                  </p>

                  <p className="text-sm text-slate-400 mt-0.5">
                    {profileRole === "admin" &&
                      "Full access to all modules, users, and settings."}

                    {profileRole === "manager" &&
                      "Approve quotations, view reports, manage approvals."}

                    {profileRole === "sales_rep" &&
                      "Create inquiries, generate quotations, track status."}
                  </p>
                </div>

                <Badge tone="brand">
                  {ROLE_LABELS[profileRole] || profileRole}
                </Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Photo modal */}

      <Modal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        title="Profile Photo"
        subtitle="Upload from device or take a photo"
        size="sm"
        footer={
          <Button
            variant="secondary"
            onClick={() => setPhotoOpen(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        }
      >
        <div className="space-y-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <Camera size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Take Photo
              </p>

              <p className="text-xs text-slate-400">Use your device camera</p>
            </div>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition text-left"
          >
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <ImageIcon size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Upload from Device
              </p>

              <p className="text-xs text-slate-400">
                JPG, PNG or WebP (max 2MB)
              </p>
            </div>
          </button>

          {profileAvatar && (
            <button
              onClick={removePhoto}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50/40 dark:hover:bg-red-950/30 transition text-left"
            >
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <Trash2 size={22} />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Remove Photo
                </p>

                <p className="text-xs text-slate-400">
                  Revert to initials avatar
                </p>
              </div>
            </button>
          )}
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            pickFile(e.target.files?.[0]);

            e.target.value = "";
          }}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            pickFile(e.target.files?.[0]);

            e.target.value = "";
          }}
        />
      </Modal>
    </div>
  );
}

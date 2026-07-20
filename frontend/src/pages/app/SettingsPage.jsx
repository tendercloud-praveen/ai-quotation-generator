import { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Database, Palette } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Card, CardHeader, CardBody } from '../../components/Card';
import Button from '../../components/Button';
import { Input, Select } from '../../components/Field';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../lib/useTheme';
import { useRole } from '../../lib/RoleContext';
import { ROLE_LABELS } from '../../lib/nav';

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { user } = useRole();
  const toast = useToast();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [taxRate, setTaxRate] = useState('18');

  const saveSettings = () => toast.success('Settings saved.');

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} />
      <PageHeader title="Settings" subtitle="Manage your workspace preferences and configuration." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader title="Appearance" subtitle="Customize the look and feel" icon={Palette} />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Theme</p>
                  <p className="text-sm text-slate-400">Switch between light and dark mode</p>
                </div>
              </div>
              <button onClick={toggle} className={`relative h-7 w-12 rounded-full transition ${theme === 'dark' ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="Notifications" subtitle="Manage alert preferences" icon={Bell} />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive updates via email</p>
              </div>
              <button onClick={() => setNotifEmail(!notifEmail)} className={`relative h-7 w-12 rounded-full transition ${notifEmail ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${notifEmail ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Push Notifications</p>
                <p className="text-sm text-slate-400">Browser push alerts</p>
              </div>
              <button onClick={() => setNotifPush(!notifPush)} className={`relative h-7 w-12 rounded-full transition ${notifPush ? 'bg-brand-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${notifPush ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Business */}
        <Card>
          <CardHeader title="Business Configuration" subtitle="Quotation defaults" icon={SettingsIcon} />
          <CardBody className="space-y-4">
            <Input label="Company Name" defaultValue={user?.companyName} />
            <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </Select>
            <Input label="Default Tax Rate (%)" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader title="Security" subtitle="Account protection" icon={Shield} />
          <CardBody className="space-y-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Two-Factor Auth</p>
                <p className="text-sm text-slate-400">Not configured</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">Inactive</span>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Session Timeout</p>
                <p className="text-sm text-slate-400">Auto logout after inactivity</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">30 min</span>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Role</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">{ROLE_LABELS[user?.role]}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      {/* Data info */}
      <Card>
        <CardHeader title="Data Storage" subtitle="This app uses browser localStorage" icon={Database} />
        <CardBody>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-700 dark:text-blue-300">
            All data is stored locally in your browser. No backend or external API is used. Clearing browser data will reset all records.
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

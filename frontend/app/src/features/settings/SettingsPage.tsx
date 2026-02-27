import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixInput } from '@/components/ui/MatrixInput';
import { MatrixToggle } from '@/components/ui/MatrixToggle';
import { useUserStore, useOnboardingStore } from '@/stores';
import { cn } from '@/lib/utils';
import {
  User,
  Link,
  Bell,
  Shield,
  AlertTriangle,
  Github,
  Linkedin,
  RefreshCw,
  Download,
  Trash2,
  Camera,
  ChevronDown,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'accounts', label: 'Connected Accounts', icon: Link },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

const ROLES = [
  'Software Engineer',
  'Data Scientist',
  'ML Engineer',
  'Frontend Developer',
  'Backend Developer',
  'DevOps Engineer',
  'Product Manager',
  'Full Stack Developer',
  'UI/UX Designer',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, updateUser } = useUserStore();
  const { githubConnected, linkedInConnected, connectGitHub, connectLinkedIn } = useOnboardingStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    targetRole: user?.targetRole || '',
    bio: user?.bio || '',
    language: user?.language || 'English',
  });
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    courseReminders: true,
    weeklyReport: false,
    autoPostLinkedIn: false,
  });
  const [privacy, setPrivacy] = useState({
    allowScraping: true,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  const handleSaveProfile = () => {
    updateUser(formData);
    alert('Profile saved successfully!');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmEmail === user?.email) {
      alert('Account deleted successfully!');
    } else {
      alert('Email does not match!');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-3">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-none bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {formData.fullName.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <MatrixButton variant="secondary" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </MatrixButton>
              </div>
            </div>

            {/* Name */}
            <MatrixInput
              label="Full Name"
              value={formData.fullName}
              onChange={(value) => setFormData({ ...formData, fullName: value })}
            />

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-400 px-4 py-3 rounded-none cursor-not-allowed"
              />
              <p className="text-slate-400 text-xs mt-1">Email cannot be changed</p>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Target Role</label>
              <div className="relative">
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-none appearance-none focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select a role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Language Preference</label>
              <div className="relative">
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-none appearance-none focus:outline-none focus:border-emerald-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                maxLength={250}
                className="w-full bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-none resize-none focus:outline-none focus:border-emerald-500 h-24"
              />
              <p className="text-slate-400 text-xs mt-1 text-right">
                {formData.bio.length}/250
              </p>
            </div>

            <MatrixButton onClick={handleSaveProfile} className="w-full">
              Save Changes
            </MatrixButton>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6">
            {/* GitHub */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-none border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-none flex items-center justify-center">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">GitHub</h4>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-none', githubConnected ? 'bg-emerald-500' : 'bg-slate-400')} />
                    <span className="text-slate-500 text-sm">
                      {githubConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>
              <MatrixButton
                variant={githubConnected ? 'danger' : 'secondary'}
                size="sm"
                onClick={githubConnected ? () => { } : connectGitHub}
              >
                {githubConnected ? 'Disconnect' : 'Connect GitHub'}
              </MatrixButton>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-none border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0077B5] rounded-none flex items-center justify-center">
                  <Linkedin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-medium">LinkedIn</h4>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-none', linkedInConnected ? 'bg-emerald-500' : 'bg-slate-400')} />
                    <span className="text-slate-500 text-sm">
                      {linkedInConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>
              <MatrixButton
                variant={linkedInConnected ? 'danger' : 'secondary'}
                size="sm"
                onClick={linkedInConnected ? () => { } : connectLinkedIn}
              >
                {linkedInConnected ? 'Disconnect' : 'Connect LinkedIn'}
              </MatrixButton>
            </div>

            {/* Re-sync */}
            <MatrixButton variant="ghost" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-sync Profile Data
            </MatrixButton>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <MatrixToggle
              checked={notifications.jobAlerts}
              onChange={(checked) => setNotifications({ ...notifications, jobAlerts: checked })}
              label="Job match alerts"
              description="Get notified when new jobs match your profile"
            />
            <MatrixToggle
              checked={notifications.courseReminders}
              onChange={(checked) => setNotifications({ ...notifications, courseReminders: checked })}
              label="Course completion reminders"
              description="Reminders to continue your learning streak"
            />
            <MatrixToggle
              checked={notifications.weeklyReport}
              onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
              label="Weekly skill report"
              description="Summary of your progress every week"
            />
            <MatrixToggle
              checked={notifications.autoPostLinkedIn}
              onChange={(checked) => setNotifications({ ...notifications, autoPostLinkedIn: checked })}
              label="Auto-post to LinkedIn on milestone"
              description="Automatically share achievements on LinkedIn"
            />
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <MatrixToggle
              checked={privacy.allowScraping}
              onChange={(checked) => setPrivacy({ ...privacy, allowScraping: checked })}
              label="Allow profile scraping"
              description="We use your GitHub and LinkedIn data to build your skill profile. Turn off to use assessment mode only."
            />

            <div className="pt-4 border-t border-slate-200">
              <MatrixButton variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </MatrixButton>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <MatrixButton variant="danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Scraped Data
              </MatrixButton>
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-none">
            <h4 className="text-red-600 font-semibold mb-2">Delete Account</h4>
            <p className="text-slate-600 text-sm mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <MatrixButton variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </MatrixButton>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout activeItem="settings" onNavigate={onNavigate} title="Settings">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <MatrixCard className="md:col-span-1 h-fit">
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </MatrixCard>

        {/* Tab Content */}
        <MatrixCard className="md:col-span-3">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          {renderTabContent()}
        </MatrixCard>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white border border-red-200 rounded-none shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
            <p className="text-slate-600 mb-4">
              To confirm deletion, please type your email address: <strong className="text-slate-900">{user?.email}</strong>
            </p>
            <MatrixInput
              value={deleteConfirmEmail}
              onChange={setDeleteConfirmEmail}
              placeholder="Enter your email"
              className="mb-4"
            />
            <div className="flex gap-3">
              <MatrixButton variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </MatrixButton>
              <MatrixButton variant="danger" onClick={handleDeleteAccount} className="flex-1">
                Delete Account
              </MatrixButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

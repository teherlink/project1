'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type WalletData = {
  id: number;
  currency: string;
  balance: string;
  locked_balance: string;
  staked_balance: string;
  available_balance: string;
};

type ReferralEarnings = {
  total_bonus: string;
  referral_count: number;
  events: Array<Record<string, any>>;
};

type WithdrawalRequest = {
  id: number;
  amount: string | number;
  status: string;
  requested_at: string;
  withdrawal_address?: string | null;
};

type DepositEvent = {
  id: number;
  previous_balance: string | number;
  new_balance: string | number;
  detected_at: string;
};

type ProfileData = {
  id: number;
  email: string;
  username: string;
  full_name: string;
  email_verified: boolean;
  assigned_wallet_address: string | null;
  wallet_address: string | null;
  wallet_status: string | null;
  last_chain_sync_at: string | null;
  referral_code?: string | null;
  referral_earnings?: ReferralEarnings | null;
  wallet: WalletData;
  withdrawal_requests?: WithdrawalRequest[];
  deposit_events?: DepositEvent[];
};

type StakingCampaign = {
  id: number;
  name: string;
  return_percent: string | number;
  risk_level: string;
};

type UserStake = {
  id: number;
  campaign_id: number;
  amount: string;
  started_at: string;
  status: string;
  withdrawn_at: string | null;
  payout_amount: string | null;
  last_claimed_at: string | null;
  claimed_amount: string | null;
  lock_until: string | null;
  campaign: { return_percent: number };
  months_elapsed: number;
  claimable_months: number;
  claimable_amount: number;
  locked: boolean;
  remaining_lock_days: number;
};

export default function ProfilePage() {
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [campaigns, setCampaigns] = useState<StakingCampaign[]>([]);
  const [stakes, setStakes] = useState<UserStake[]>([]);
  const [activePage, setActivePage] = useState<'dashboard' | 'staking' | 'wallet' | 'account' | 'referral'>('dashboard');
  const [message, setMessage] = useState('');
  const [selectedApy, setSelectedApy] = useState<5 | 10 | 20 | 30>(10);
  const [stakePercent, setStakePercent] = useState(100);
  const [stakeLoadingId, setStakeLoadingId] = useState<number | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [walletOpen, setWalletOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const walletDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      window.location.href = '/app/login';
      return;
    }

    setToken(authToken);
    fetchProfile(authToken).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
        setWalletOpen(false);
      }
    }

    if (walletOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [walletOpen]);

  async function fetchProfile(authToken: string) {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user ?? data.profile ?? null);
        setCampaigns(data.campaigns ?? []);
        setStakes(data.stakes ?? []);
      }
    } catch (error) {
      console.error(error);
      setMessage('Unable to load profile.');
    }
  }

  async function fetchCampaigns(authToken: string) {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(data.campaigns ?? []);
        setStakes(data.stakes ?? []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleStake(campaignId: number, amount: number) {
    if (!token) return setMessage('Login required.');
    if (!amount || amount <= 0) return setMessage('Enter a stake amount.');
    setStakeLoadingId(campaignId);

    try {
      const res = await fetch('/api/staking/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ campaign_id: campaignId, amount }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Stake failed.');
      setToast({ text: data.message || 'Stake submitted.', visible: true });
      setTimeout(() => setToast({ text: '', visible: false }), 2800);
      fetchProfile(token);
      fetchCampaigns(token);
    } catch (error) {
      console.error(error);
      setMessage('Stake failed.');
    } finally {
      setStakeLoadingId(null);
    }
  }

  async function handleClaim(stakeId: number) {
    if (!token) return setMessage('Login required.');
    setStakeLoadingId(stakeId);
    try {
      const res = await fetch('/api/staking/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stake_id: stakeId }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Claim failed.');
      setToast({ text: data.message || 'Claim submitted.', visible: true });
      setTimeout(() => setToast({ text: '', visible: false }), 2800);
      fetchProfile(token);
      fetchCampaigns(token);
    } catch (error) {
      console.error(error);
      setMessage('Claim failed.');
    } finally {
      setStakeLoadingId(null);
    }
  }

  async function handleUnstake(stakeId: number) {
    if (!token) return setMessage('Login required.');
    setStakeLoadingId(stakeId);
    try {
      const res = await fetch('/api/staking/unstake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stake_id: stakeId }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Unstake failed.');
      setToast({ text: data.message || 'Unstaked successfully.', visible: true });
      setTimeout(() => setToast({ text: '', visible: false }), 2800);
      fetchProfile(token);
      fetchCampaigns(token);
    } catch (error) {
      console.error(error);
      setMessage('Unstake failed.');
    } finally {
      setStakeLoadingId(null);
    }
  }

  async function handleUpdateProfile() {
    if (!token) return setMessage('Login required.');
    const trimmedName = editFullName.trim();
    const trimmedUsername = editUsername.trim();
    if (!trimmedName || !trimmedUsername) {
      return setMessage('Please fill in all account fields.');
    }

    setProfileSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: trimmedName, username: trimmedUsername }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Unable to update profile.');
      setProfile(data.user ?? data.profile ?? profile);
      setToast({ text: data.message || 'Profile updated.', visible: true });
      setTimeout(() => setToast({ text: '', visible: false }), 2800);
      setIsEditingProfile(false);
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage('Unable to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!token) return setMessage('Login required.');
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setMessage('Please fill in all password fields.');
    }
    if (newPassword.length < 8) {
      return setMessage('New password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setMessage('New passwords do not match.');
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Unable to change password.');
      setToast({ text: data.message || 'Password updated.', visible: true });
      setTimeout(() => setToast({ text: '', visible: false }), 2800);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage('Unable to change password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleWithdraw() {
    if (!token) return setMessage('Login required.');
    const amount = Number(withdrawAmount);
    const normalizedAddress = withdrawAddress.trim();
    const beP20AddressPattern = /^0x[a-fA-F0-9]{40}$/;

    if (!withdrawAmount || Number.isNaN(amount) || amount <= 0) {
      return setMessage('Enter a valid withdrawal amount.');
    }
    if (!normalizedAddress || !beP20AddressPattern.test(normalizedAddress)) {
      return setMessage('Enter a valid BEP20 USDT wallet address starting with 0x and 40 hex characters.');
    }

    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount, withdrawal_address: normalizedAddress }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || 'Withdrawal failed.');

      setToast({ text: data.message || 'Withdrawal request created.', visible: true });
      setTimeout(() => setToast({ text: '', visible: false }), 2800);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setMessage('');
      await fetchProfile(token);
    } catch (error) {
      console.error(error);
      setMessage('Withdrawal failed.');
    } finally {
      setWithdrawLoading(false);
    }
  }

  function copyAddress() {
    const address = profile?.wallet_address || profile?.assigned_wallet_address || '';
    if (!address) return;
    navigator.clipboard?.writeText(address).then(() => setToast({ text: 'Address copied', visible: true }));
    setTimeout(() => setToast({ text: '', visible: false }), 2400);
  }

  function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/app/login';
  }

  const availableBalance = profile ? Number(profile.wallet.available_balance || 0) : 0;
  const computedStakeAmount = Number((availableBalance * (stakePercent / 100)).toFixed(6));
  const nearestCampaign = (apy: number) => {
    if (!campaigns.length) return null;
    return campaigns.reduce((closest, campaign) => {
      if (!closest) return campaign;
      const diff = Math.abs(Number(campaign.return_percent) - apy);
      const currentDiff = Math.abs(Number(closest.return_percent) - apy);
      return diff < currentDiff ? campaign : closest;
    }, campaigns[0]);
  };

  const displayedAddress = profile?.wallet_address || profile?.assigned_wallet_address || '';
  const truncatedAddress = displayedAddress ? `${displayedAddress.slice(0, 6)}...${displayedAddress.slice(-4)}` : 'No wallet';

  if (isLoading && !profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#111827', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
          <div style={{ width: 46, height: 46, margin: '0 auto', borderRadius: '50%', border: '3px solid #dbeafe', borderTopColor: '#0ea5a4', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ fontSize: 15, fontWeight: 600 }}>Loading your profile…</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-shell${mobileNavOpen ? ' mobile-open' : ''}`} style={{ minHeight: '100vh', color: '#111827', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <aside className={`profile-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="profile-sidebar-brand">
          <button onClick={() => setActivePage('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 9, border: 'none', background: 'transparent', color: '#111827', cursor: 'pointer', fontSize: 18, fontWeight: 700, letterSpacing: '0.5px', padding: 0 }}>
            <span style={{ fontSize: 20 }}>◆</span>
            <span>TetherLink</span>
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <SectionHeading title="Main" />
          <SidebarButton active={activePage === 'dashboard'} icon="▦" label="Dashboard" onClick={() => { setActivePage('dashboard'); setMobileNavOpen(false); }} />
          <SidebarButton active={activePage === 'staking'} icon="◉" label="Staking" onClick={() => { setActivePage('staking'); setMobileNavOpen(false); }} />
          <SidebarButton active={activePage === 'wallet'} icon="◫" label="Wallet" onClick={() => { setActivePage('wallet'); setMobileNavOpen(false); }} />
          <SidebarButton active={activePage === 'account'} icon="♙" label="Account" onClick={() => { setActivePage('account'); setMobileNavOpen(false); }} />
          <SidebarButton active={activePage === 'referral'} icon="↻" label="Referral" onClick={() => { setActivePage('referral'); setMobileNavOpen(false); }} />

          <div style={{ height: 1, background: '#1c2026', margin: '14px 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px', borderRadius: 9, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
            <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#e2e8f0' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.18)' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{truncatedAddress}</div>
              <div style={{ marginTop: 2, fontSize: 10, color: '#16a34a' }}>Connected</div>
            </div>
          </div>
        </nav>
      </aside>

      <main className="profile-main">
        <header className="profile-header">
          <div className="profile-header-right">
            <button className="mobile-menu-btn" onClick={() => setMobileNavOpen((prev) => !prev)} style={{ display: 'none', width: 42, height: 42, alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: 20 }}>☰</button>
            <button style={{ position: 'relative', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: 17 }}>♧</button>
            <button onClick={() => setActivePage('account')} style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', color: '#374151', cursor: 'pointer', fontSize: 18 }}>⚙</button>

            <div style={{ position: 'relative' }} ref={walletDropdownRef}>
              <button onClick={() => setWalletOpen((prev) => !prev)} style={{ height: 42, display: 'flex', alignItems: 'center', gap: 9, padding: '0 13px', border: '1px solid #d1d5db', borderRadius: 10, background: '#f8fafc', color: '#111827', cursor: 'pointer' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{truncatedAddress}</span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>{walletOpen ? '⌃' : '⌄'}</span>
              </button>

              {walletOpen && (
                <div style={{ position: 'absolute', top: 52, right: 0, width: 290, padding: 16, boxSizing: 'border-box', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 14, boxShadow: '0 18px 50px rgba(15,23,42,0.12)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <span style={{ color: '#16a34a', fontSize: 12 }}>● Connected</span>
                    <span style={{ color: '#6b7280', fontSize: 11 }}>Ethereum</span>
                  </div>
                  <div style={{ padding: '11px 12px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 12, color: '#111827', wordBreak: 'break-all' }}>{displayedAddress || '—'}</div>
                  <div style={{ marginTop: 17, fontSize: 11, color: '#4b5563' }}>Portfolio Balance</div>
                  <div style={{ marginTop: 4, fontSize: 21, fontWeight: 600, color: '#111827' }}>${profile?.wallet ? Number(profile.wallet.balance).toFixed(2) : '—'}</div>
                  <div style={{ height: 1, margin: '15px 0', background: '#242a31' }} />
                  <button onClick={copyAddress} style={{ width: '100%', padding: '10px 7px', border: 'none', background: 'transparent', color: '#aeb6c1', textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>Copy Address</button>
                  <a href={`https://etherscan.io/address/${displayedAddress}`} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '10px 7px', color: '#aeb6c1', textDecoration: 'none', fontSize: 13 }}>View on Explorer</a>
                  <div style={{ height: 1, margin: '15px 0', background: '#242a31' }} />
                  <button onClick={logout} style={{ width: '100%', padding: '10px 7px', border: 'none', background: 'transparent', color: '#aeb6c1', textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>Disconnect Wallet</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="profile-content">
          {message ? <div className="alert-message">{message}</div> : null}

          {activePage === 'dashboard' && (
            <section>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>Dashboard</h1>
              <p style={{ margin: '8px 0 24px', color: '#4b5563' }}>Scan the deposit QR code to fund your account and review all balances.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                    <h3 style={{ margin: '0 0 14px' }}>Balance summary</h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <MetricCard label="Total balance" value={profile?.wallet ? `${Number(profile.wallet.balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                      <MetricCard label="Available balance" value={profile?.wallet ? `${Number(profile.wallet.available_balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                      <MetricCard label="Staked balance" value={profile?.wallet ? `${Number(profile.wallet.staked_balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                      <MetricCard label="Locked balance" value={profile?.wallet ? `${Number(profile.wallet.locked_balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                      <MetricCard label="Referral earnings" value={profile?.referral_earnings ? `${Number(profile.referral_earnings.total_bonus).toFixed(6)} ${profile.wallet.currency}` : '0'} />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, display: 'grid', gap: 18 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px' }}>Deposit USDT</h3>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>Scan the QR code or copy your deposit address.</div>
                      </div>
                      <div style={{ padding: '7px 12px', borderRadius: 10, background: '#e2e8f0', color: '#0f172a', fontSize: 13, fontWeight: 600 }}>USDT</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, alignItems: 'center' }}>
                    <div style={{ display: 'grid', gap: 12, justifyItems: 'center', padding: 18, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                      {displayedAddress ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(displayedAddress)}`}
                          alt="Deposit QR code"
                          style={{ width: '100%', height: 'auto', maxWidth: 240, borderRadius: 14 }}
                        />
                      ) : (
                        <div style={{ width: 240, height: 240, display: 'grid', placeItems: 'center', borderRadius: 14, background: '#f8fafc', color: '#6b7280' }}>No address available</div>
                      )}
                      <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>Scan to deposit USDT.</div>
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                      <div style={{ padding: '18px 16px', borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Deposit address</div>
                        <div style={{ wordBreak: 'break-all', fontWeight: 700, color: '#111827' }}>{displayedAddress || 'No address available'}</div>
                        <button
                          onClick={copyAddress}
                          style={{ marginTop: 14, width: '100%', padding: '10px 14px', borderRadius: 10, border: 'none', background: '#0ea5a4', color: '#fff', cursor: 'pointer' }}
                        >
                          Copy address
                        </button>
                      </div>

                      <div style={{ padding: '18px 16px', borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Deposit instructions</div>
                        <div style={{ color: '#111827', lineHeight: 1.6, fontSize: 14 }}>
                          Send USDT to this address to fund your account. Balance updates after network confirmation.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'staking' && (
            <section>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>Staking</h1>
              <p style={{ margin: '8px 0 24px', color: '#4b5563' }}>Choose your APY and stake a percentage of your available balance.</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24, display: 'grid', gap: 20 }}>
                  <div style={{ display: 'grid', gap: 18 }}>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Stake calculator</h3>
                          <div style={{ color: '#6b7280', fontSize: 14 }}>Select APY and set the stake amount as a percentage of available funds.</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 20, color: '#111827' }}>{selectedApy}% APY</div>
                      </div>

                      <div style={{ display: 'grid', gap: 10, background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 16, padding: 16 }}>
                        <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>APY options</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                          {[5, 10, 20, 30].map((apy) => (
                            <button
                              key={apy}
                              onClick={() => setSelectedApy(apy as 5 | 10 | 20 | 30)}
                              style={{
                                minHeight: 50,
                                borderRadius: 14,
                                border: '1px solid',
                                borderColor: selectedApy === apy ? '#0ea5a4' : '#d1d5db',
                                background: selectedApy === apy ? '#0ea5a4' : '#ffffff',
                                color: selectedApy === apy ? '#ffffff' : '#111827',
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {apy}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 10, background: '#ffffff', border: '1px solid #d1d5db', borderRadius: 16, padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ color: '#4b5563', fontWeight: 600 }}>Stake amount</div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{stakePercent}%</div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={stakePercent}
                        onChange={(event) => setStakePercent(Number(event.target.value))}
                        style={{ width: '100%', accentColor: '#0ea5a4' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: 12 }}>
                        <span>1%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151', fontSize: 13, marginTop: 6 }}>
                        <span>Stake amount: {profile?.wallet ? `${computedStakeAmount.toFixed(6)} ${profile.wallet.currency}` : '—'}</span>
                        <span>Available: {profile?.wallet ? `${Number(profile.wallet.available_balance).toFixed(6)} ${profile.wallet.currency}` : '—'}</span>
                      </div>
                    </div>

                  </div>

                  <div style={{ display: 'grid', gap: 14 }}>
                    {campaigns.length === 0 ? (
                      <div style={{ color: '#6b7280' }}>Loading campaigns…</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 12, padding: 16, borderRadius: 20, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Stake now</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>Nearest campaign is selected based on your APY choice.</div>
                          </div>
                          <button
                            onClick={() => {
                              const selectedCampaign = nearestCampaign(selectedApy);
                              if (!selectedCampaign) {
                                return setMessage('No campaign available for selected APY.');
                              }
                              if (!computedStakeAmount || computedStakeAmount <= 0) {
                                return setMessage('Enter a stake amount.');
                              }
                              handleStake(selectedCampaign.id, computedStakeAmount);
                            }}
                            disabled={!campaigns.length || !profile?.wallet}
                            style={{
                              width: '100%',
                              padding: '18px 24px',
                              borderRadius: 999,
                              background: '#111827',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 16,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            Stake now
                          </button>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>If exact APY is unavailable, the nearest campaign will be chosen.</div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Staking history</h2>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>Review your active stakes and take action.</div>
                      </div>
                    </div>
                    {stakes.length === 0 ? (
                      <div style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#6b7280' }}>No staking history available.</div>
                    ) : (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {stakes.map((stake) => (
                          <div key={stake.id} style={{ display: 'grid', gap: 10, padding: 18, borderRadius: 16, background: '#ffffff', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Staked {Number(stake.amount).toFixed(6)} {profile?.wallet.currency}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(stake.started_at).toLocaleDateString()} · {stake.status === 'active' ? 'Active' : 'Completed'}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {stake.status === 'active' && (
                                  <button
                                    onClick={() => handleClaim(stake.id)}
                                    disabled={stakeLoadingId === stake.id || stake.claimable_months <= 0}
                                    style={{ padding: '10px 14px', borderRadius: 12, background: '#0ea5a4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                  >
                                    Claim
                                  </button>
                                )}
                                {stake.status === 'active' && (
                                  <button
                                    onClick={() => handleUnstake(stake.id)}
                                    disabled={stakeLoadingId === stake.id}
                                    style={{ padding: '10px 14px', borderRadius: 12, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                  >
                                    Unstake
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'grid', gap: 6, color: '#4b5563', fontSize: 13 }}>
                              <div>APY: {stake.campaign.return_percent}%</div>
                              <div>Claimable: {stake.claimable_amount.toFixed(6)} {profile?.wallet.currency}</div>
                              <div>{stake.locked ? `Locked for ${stake.remaining_lock_days} more days` : 'Unlocked'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'wallet' && (
            <section>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>Wallet</h1>
              <p style={{ margin: '8px 0 24px', color: '#4b5563' }}>Manage your assets, deposits and withdrawals.</p>

              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, display: 'grid', gap: 14 }}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Total Portfolio Balance</div>
                  <div style={{ fontSize: 32, fontWeight: 600 }}>${profile?.wallet ? Number(profile.wallet.balance).toFixed(2) : '—'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    <MetricCard label="Available" value={profile?.wallet ? `${Number(profile.wallet.available_balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                    <MetricCard label="Locked" value={profile?.wallet ? `${Number(profile.wallet.locked_balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                    <MetricCard label="Staked" value={profile?.wallet ? `${Number(profile.wallet.staked_balance).toFixed(6)} ${profile.wallet.currency}` : '—'} />
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, display: 'grid', gap: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Withdraw funds</div>
                  <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                      Amount (USDT)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(event) => setWithdrawAmount(event.target.value)}
                        placeholder="0.00"
                        style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                      BEP20 USDT wallet address
                      <input
                        type="text"
                        value={withdrawAddress}
                        onChange={(event) => setWithdrawAddress(event.target.value)}
                        placeholder="0x..."
                        style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                      />
                    </label>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawLoading}
                      style={{ width: 'max-content', padding: '12px 18px', borderRadius: 12, border: 'none', background: '#111827', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {withdrawLoading ? 'Submitting…' : 'Request withdrawal'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                    <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 700, color: '#111827' }}>Deposit history</div>
                    {profile?.deposit_events?.length ? (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {profile.deposit_events.map((event) => (
                          <div key={event.id} style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ fontWeight: 700, color: '#111827' }}>+{Number(event.new_balance || 0).toFixed(6)} USDT</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(event.detected_at).toLocaleString()}</div>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: '#4b5563' }}>
                              Previous: {Number(event.previous_balance || 0).toFixed(6)} · New: {Number(event.new_balance || 0).toFixed(6)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 18, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#6b7280' }}>No deposits yet.</div>
                    )}
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                    <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 700, color: '#111827' }}>Withdrawal history</div>
                    {profile?.withdrawal_requests?.length ? (
                      <div style={{ display: 'grid', gap: 12 }}>
                        {profile.withdrawal_requests.map((withdrawal) => (
                          <div key={withdrawal.id} style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ fontWeight: 700, color: '#111827' }}>-{Number(withdrawal.amount || 0).toFixed(6)} USDT</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(withdrawal.requested_at).toLocaleString()}</div>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: '#4b5563' }}>
                              Status: {withdrawal.status}
                            </div>
                            {withdrawal.withdrawal_address ? (
                              <div style={{ marginTop: 6, fontSize: 12, color: '#4b5563', wordBreak: 'break-all' }}>
                                Address: {withdrawal.withdrawal_address}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: 18, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#6b7280' }}>No withdrawals yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === 'referral' && (
            <section>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>Referral</h1>
              <p style={{ margin: '8px 0 24px', color: '#4b5563' }}>Share your referral link and earn rewards.</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1.1px' }}>Your referral code</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 10, background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827', fontWeight: 700 }}>{profile?.referral_code || 'Not available'}</div>
                      <button
                        onClick={() => {
                          const code = profile?.referral_code;
                          if (!code) return;
                          navigator.clipboard.writeText(code);
                          setToast({ text: 'Referral code copied', visible: true });
                          setTimeout(() => setToast({ text: '', visible: false }), 2400);
                        }}
                        style={{ padding: '10px 16px', borderRadius: 10, background: '#0ea5a4', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Copy code
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Share this code and track the users who sign up with it.</div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Referred users</div>
                  {profile?.referral_earnings?.events?.length ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {profile.referral_earnings.events.map((event, index) => (
                        <div key={index} style={{ display: 'grid', gap: 6, padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, color: '#111827' }}>{event.referred_username || event.referred_email || 'Referred user'}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(event.created_at).toLocaleDateString()}</div>
                          </div>
                          <div style={{ color: '#4b5563', fontSize: 13, display: 'grid', gap: 4 }}>
                            {event.referred_email ? <div>Email: {event.referred_email}</div> : null}
                            <div>Bonus earned: {event.bonus_amount ? Number(event.bonus_amount).toFixed(6) : '0'} {profile?.wallet.currency}</div>
                            <div>Deposit amount: {event.deposit_amount ? Number(event.deposit_amount).toFixed(6) : '0'} {profile?.wallet.currency}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid #e5e7eb', color: '#6b7280' }}>No referred users found yet.</div>
                  )}
                </div>
              </div>
            </section>
          )}

          {activePage === 'account' && (
            <section>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>Account</h1>
              <p style={{ margin: '8px 0 24px', color: '#4b5563' }}>Manage your account and personal information.</p>
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: '#e2e8f0', border: '1px solid #cbd5e1', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 600, color: '#111827' }}>{(profile?.full_name || profile?.username || 'U').charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{profile?.full_name || profile?.username}</div>
                      <div style={{ marginTop: 5, fontSize: 13, color: '#4b5563' }}>{profile?.email}</div>
                      <div style={{ marginTop: 6, fontSize: 11, color: '#16a34a' }}>{profile?.email_verified ? '● Verified Account' : '● Unverified Account'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!profile) return;
                      setEditFullName(profile.full_name || '');
                      setEditUsername(profile.username || '');
                      setIsEditingProfile(true);
                    }}
                    style={{ padding: '9px 15px', borderRadius: 8, border: '1px solid #d1d5db', background: '#ffffff', color: '#111827' }}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 20, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Change password</div>
                  <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                    New password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                    Confirm new password
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                    />
                  </label>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  style={{ width: 'min-content', padding: '12px 18px', borderRadius: 12, border: 'none', background: '#111827', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {passwordSaving ? 'Updating…' : 'Update password'}
                </button>
              </div>

              {isEditingProfile && (
                <div style={{ marginTop: 20, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, display: 'grid', gap: 16 }}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Edit profile details</div>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                      Full name
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(event) => setEditFullName(event.target.value)}
                        style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#4b5563' }}>
                      Username
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(event) => setEditUsername(event.target.value)}
                        style={{ width: '100%', minHeight: 42, borderRadius: 12, border: '1px solid #d1d5db', padding: '10px 12px', fontSize: 14 }}
                      />
                    </label>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={profileSaving}
                      style={{ padding: '12px 18px', borderRadius: 12, border: 'none', background: '#0ea5a4', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {profileSaving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      disabled={profileSaving}
                      style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid #d1d5db', background: '#ffffff', color: '#111827', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {toast.visible && <div style={{ position: 'fixed', right: 24, top: 88, background: '#0ea5a4', color: '#fff', padding: '8px 12px', borderRadius: 12, boxShadow: '0 10px 30px rgba(2,6,23,0.2)', fontWeight: 700 }}>{toast.text}</div>}
        </div>
      </main>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <div style={{ padding: '0 14px', marginBottom: 8, marginTop: 22, fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', color: '#59616c', textTransform: 'uppercase' }}>{title}</div>;
}

function SidebarButton({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', height: 42, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', marginBottom: 3, border: 'none', borderRadius: 9, background: active ? '#e2e8f0' : 'transparent', color: active ? '#111827' : '#6b7280', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: active ? 500 : 400 }}>
      <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: active ? '#111827' : '#9ca3af' }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 12, color: '#4b5563' }}>{label}</div>
      <div style={{ marginTop: 6, fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}

// profile.tsx
"use client";

import React, { useState } from "react";

type Page =
  | "dashboard"
  | "markets"
  | "swap"
  | "staking"
  | "wallet"
  | "transactions"
  | "rewards"
  | "referral"
  | "account"
  | "security"
  | "settings"
  | "help";

const primaryButton: React.CSSProperties = {
  padding: "10px 17px",
  borderRadius: "8px",
  border: "1px solid #ffffff",
  background: "#ffffff",
  color: "#0b0d10",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "9px 15px",
  borderRadius: "8px",
  border: "1px solid #2a3038",
  background: "#181d23",
  color: "#d9dee5",
  cursor: "pointer",
  fontSize: "13px",
};

export default function Profile() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [walletOpen, setWalletOpen] = useState(false);

  const walletAddress = "0x8A34...72F9";
  const fullWalletAddress = "0x8A34ABCDEF1234567890";

  const navigate = (page: Page) => {
    setActivePage(page);
    setWalletOpen(false);
  };

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(fullWalletAddress);
    } catch {}
  };

  const menuItem = (icon: string, label: string, page: Page) => {
    const active = activePage === page;

    return (
      <button
        key={page}
        onClick={() => navigate(page)}
        style={{
          width: "100%",
          height: "42px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 14px",
          marginBottom: "3px",
          border: "none",
          borderRadius: "9px",
          background: active ? "#191e24" : "transparent",
          color: active ? "#ffffff" : "#8f98a5",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "14px",
          fontWeight: active ? 500 : 400,
          transition: "all 0.15s ease",
        }}
      >
        <span
          style={{
            width: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "17px",
            color: active ? "#ffffff" : "#7d8692",
          }}
        >
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  };

  const sectionTitle = (title: string) => (
    <div
      style={{
        padding: "0 14px",
        marginBottom: "8px",
        marginTop: "22px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "1.2px",
        color: "#59616c",
        textTransform: "uppercase",
      }}
    >
      {title}
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "markets":
        return <SimplePage title="Markets" description="Explore available markets and live asset prices." />;
      case "swap":
        return <SimplePage title="Swap" description="Swap one supported asset for another." />;
      case "staking":
        return <StakingPage />;
      case "wallet":
        return <WalletPage />;
      case "transactions":
        return <SimplePage title="Transactions" description="View your deposits, withdrawals, swaps and staking activity." />;
      case "rewards":
        return <SimplePage title="Rewards" description="Track rewards earned from staking and referrals." />;
      case "referral":
        return <ReferralPage />;
      case "account":
        return <AccountPage />;
      case "security":
        return <SecurityPage />;
      case "settings":
        return <SettingsPage />;
      case "help":
        return <SimplePage title="Help & Support" description="Get help with your account and platform." />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0d10",
        color: "#ffffff",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "240px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          padding: "22px 14px 14px",
          background: "#0b0d10",
          borderRight: "1px solid #1c2026",
          zIndex: 1100,
        }}
      >
        <div
          style={{
            height: "50px",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            marginBottom: "4px",
          }}
        >
          <button
            onClick={() => navigate("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              border: "none",
              background: "transparent",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              padding: 0,
            }}
          >
            <span style={{ fontSize: "20px" }}>◆</span>
            <span>TetherLink</span>
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          {sectionTitle("Main")}
          {menuItem("▦", "Dashboard", "dashboard")}
          {menuItem("◈", "Markets", "markets")}
          {menuItem("⇄", "Swap", "swap")}
          {menuItem("◉", "Staking", "staking")}

          {sectionTitle("Assets")}
          {menuItem("◫", "Wallet", "wallet")}
          {menuItem("↔", "Transactions", "transactions")}
          {menuItem("✦", "Rewards", "rewards")}

          {sectionTitle("Community")}
          {menuItem("♧", "Referral", "referral")}

          {sectionTitle("Account")}
          {menuItem("♙", "Account", "account")}
          {menuItem("◉", "Security", "security")}
          {menuItem("⚙", "Settings", "settings")}
        </nav>

        <button
          onClick={() => navigate("help")}
          style={{
            width: "100%",
            height: "42px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 14px",
            border: "none",
            borderRadius: "9px",
            background: activePage === "help" ? "#191e24" : "transparent",
            color: activePage === "help" ? "#ffffff" : "#8f98a5",
            cursor: "pointer",
            fontSize: "14px",
            textAlign: "left",
          }}
        >
          <span style={{ width: "20px", display: "flex", justifyContent: "center" }}>
            ❓
          </span>
          <span>Help & Support</span>
        </button>

        <div
          style={{
            height: "1px",
            background: "#1c2026",
            margin: "14px 4px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 11px",
            borderRadius: "9px",
            background: "#11151a",
            border: "1px solid #1b2026",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              background: "#181d23",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#55d98a",
                boxShadow: "0 0 0 3px rgba(85,217,138,0.1)",
              }}
            />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                color: "#d7dce3",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {walletAddress}
            </div>
            <div style={{ marginTop: "2px", fontSize: "10px", color: "#55d98a" }}>
              Connected
            </div>
          </div>
        </div>
      </aside>

      {/* NAVBAR */}
      <header
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          left: "240px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 28px",
          boxSizing: "border-box",
          background: "#0b0d10",
          borderBottom: "1px solid #1c2026",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            style={{
              position: "relative",
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid transparent",
              borderRadius: "10px",
              background: "transparent",
              color: "#9ba3af",
              cursor: "pointer",
              fontSize: "17px",
            }}
          >
            ♧
            <span
              style={{
                position: "absolute",
                top: "9px",
                right: "9px",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#ffffff",
              }}
            />
          </button>

          <button
            onClick={() => navigate("settings")}
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid transparent",
              borderRadius: "10px",
              background: "transparent",
              color: "#9ba3af",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ⚙
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setWalletOpen(!walletOpen)}
              style={{
                height: "42px",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "0 13px",
                border: "1px solid #252b33",
                borderRadius: "10px",
                background: "#11151a",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#55d98a",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>
                {walletAddress}
              </span>
              <span style={{ color: "#7f8792", fontSize: "12px" }}>
                {walletOpen ? "⌃" : "⌄"}
              </span>
            </button>

            {walletOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  right: 0,
                  width: "290px",
                  padding: "16px",
                  boxSizing: "border-box",
                  background: "#11151a",
                  border: "1px solid #272d35",
                  borderRadius: "14px",
                  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <span style={{ color: "#55d98a", fontSize: "12px" }}>
                    ● Connected
                  </span>
                  <span style={{ color: "#737c88", fontSize: "11px" }}>
                    Ethereum
                  </span>
                </div>

                <div
                  style={{
                    padding: "11px 12px",
                    background: "#0b0d10",
                    border: "1px solid #20252c",
                    borderRadius: "9px",
                    fontSize: "12px",
                    color: "#d8dde5",
                    wordBreak: "break-all",
                  }}
                >
                  {fullWalletAddress}
                </div>

                <div style={{ marginTop: "17px", fontSize: "11px", color: "#707985" }}>
                  Portfolio Balance
                </div>
                <div style={{ marginTop: "4px", fontSize: "21px", fontWeight: 600 }}>
                  $8,420.52
                </div>

                <div style={{ height: "1px", margin: "15px 0", background: "#242a31" }} />

                <button
                  onClick={copyWallet}
                  style={dropdownButton}
                >
                  Copy Address
                </button>

                <button
                  onClick={() => navigate("wallet")}
                  style={dropdownButton}
                >
                  View Wallet →
                </button>

                <button
                  onClick={() => navigate("transactions")}
                  style={dropdownButton}
                >
                  Transactions →
                </button>

                <div style={{ height: "1px", margin: "15px 0", background: "#242a31" }} />

                <button style={dropdownButton}>Disconnect Wallet</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          marginLeft: "240px",
          paddingTop: "72px",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "32px",
            boxSizing: "border-box",
          }}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

/* ========================= DASHBOARD ========================= */

function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your portfolio and activity." />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <StatCard label="Portfolio Value" value="$8,420.52" change="+2.21%" />
        <StatCard label="Total Staked" value="$5,420.00" change="+$182.42" />
        <StatCard label="Rewards Earned" value="$182.42" change="+$12.82" />
        <StatCard label="24h Change" value="+$182.42" change="+2.21%" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "20px",
        }}
      >
        <Panel title="Portfolio">
          <div
            style={{
              height: "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#59616c",
              border: "1px dashed #252b33",
              borderRadius: "10px",
            }}
          >
            Portfolio chart will appear here
          </div>
        </Panel>

        <Panel title="Active Staking">
          <AssetRow name="USDT" amount="$2,000.00" apy="8.50% APY" />
          <AssetRow name="BTC" amount="$500.00" apy="3.20% APY" />
          <AssetRow name="ETH" amount="$1,200.00" apy="5.10% APY" />
        </Panel>
      </div>

      <div style={{ height: "20px" }} />

      <Panel title="Recent Activity">
        <ActivityRow type="Stake" asset="USDT" amount="+$2,000.00" date="Today" />
        <ActivityRow type="Swap" asset="ETH → USDT" amount="$450.20" date="Yesterday" />
        <ActivityRow type="Reward" asset="USDT" amount="+$12.82" date="Aug 06" />
      </Panel>
    </div>
  );
}

/* ========================= ACCOUNT ========================= */

function AccountPage() {
  return (
    <div>
      <PageHeader title="Account" description="Manage your account and personal information." />

      <Panel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1b2027",
                border: "1px solid #2a3038",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              AS
            </div>

            <div>
              <div style={{ marginTop: "5px", fontSize: "13px", color: "#737c88" }}>
              </div>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "#55d98a" }}>
                ● Verified Account
              </div>
            </div>
          </div>

          <button style={secondaryButton}>Edit Profile</button>
        </div>
      </Panel>

      <div style={{ height: "20px" }} />

      <Panel>
        <AccountRow
          title="Personal Information"
          description="Name, email and account details"
          onClick={() => {}}
        />
        <AccountRow
          title="Verification"
          description="Identity verification and account status"
          status="Verified"
          onClick={() => {}}
        />
        <AccountRow
          title="Wallet Addresses"
          description="Manage connected blockchain wallets"
          onClick={() => {}}
        />
        <AccountRow
          title="Referral"
          description="View your referral program"
          onClick={() => {}}
        />
        <AccountRow
          title="Security"
          description="Password, 2FA and active sessions"
          onClick={() => {}}
          last
        />
      </Panel>
    </div>
  );
}

/* ========================= REFERRAL ========================= */

function ReferralPage() {
  return (
    <div>
      <PageHeader title="Referral" description="Invite friends and earn rewards." />

      <Panel>
        <div style={{ fontSize: "13px", color: "#737c88", marginBottom: "8px" }}>
          Your Referral Code
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              flex: 1,
              padding: "14px",
              background: "#0b0d10",
              border: "1px solid #242a31",
              borderRadius: "9px",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            
          </div>
          <button style={secondaryButton}>Copy</button>
        </div>

        <div style={{ marginTop: "20px", fontSize: "13px", color: "#737c88", marginBottom: "8px" }}>
          Your Referral Link
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              flex: 1,
              padding: "14px",
              background: "#0b0d10",
              border: "1px solid #242a31",
              borderRadius: "9px",
              fontSize: "13px",
              color: "#aeb6c1",
            }}
          >
          </div>
          <button style={secondaryButton}>Copy Link</button>
        </div>
      </Panel>

      <div style={{ height: "20px" }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        <StatCard label="Friends Invited" value="24" />
        <StatCard label="Successful Referrals" value="18" />
        <StatCard label="Rewards Earned" value="$184.20" />
      </div>

      <div style={{ height: "20px" }} />

      <Panel title="Referral Activity">
        <ReferralRow wallet="0x82...91" date="08 Aug 2026" reward="$12.40" />
        <ReferralRow wallet="0x71...32" date="06 Aug 2026" reward="$8.20" />
        <ReferralRow wallet="0x44...91" date="04 Aug 2026" reward="$14.10" />
      </Panel>
    </div>
  );
}

/* ========================= STAKING ========================= */

function StakingPage() {
  return (
    <div>
      <PageHeader title="Staking" description="Manage your staking positions and rewards." />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        <StatCard label="Total Staked" value="$5,420.00" />
        <StatCard label="Total Rewards" value="$182.42" />
        <StatCard label="Pending Rewards" value="$12.82" />
        <StatCard label="Active Positions" value="3" />
      </div>

      <div style={{ height: "20px" }} />

      <Panel title="Your Positions">
        <StakingPosition
          asset="USDT"
          amount="$2,000.00"
          apy="8.50%"
          rewards="$82.42"
          status="Active"
        />
        <StakingPosition
          asset="BTC"
          amount="$500.00"
          apy="3.20%"
          rewards="$21.42"
          status="Active"
        />
        <StakingPosition
          asset="ETH"
          amount="$2,920.00"
          apy="5.10%"
          rewards="$78.58"
          status="Active"
        />
      </Panel>

      <div style={{ height: "20px" }} />

      <button style={primaryButton}>+ Start New Stake</button>
    </div>
  );
}

/* ========================= WALLET ========================= */

function WalletPage() {
  return (
    <div>
      <PageHeader title="Wallet" description="Manage your assets, deposits and withdrawals." />

      <Panel>
        <div style={{ color: "#737c88", fontSize: "12px" }}>Total Portfolio Balance</div>
        <div style={{ marginTop: "8px", fontSize: "32px", fontWeight: 600 }}>
          $8,420.52
        </div>
        <div style={{ marginTop: "7px", color: "#55d98a", fontSize: "13px" }}>
          +$182.42 (+2.21%) today
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button style={primaryButton}>Deposit</button>
          <button style={secondaryButton}>Withdraw</button>
        </div>
      </Panel>

      <div style={{ height: "20px" }} />

      <Panel title="Assets">
        <WalletAsset asset="USDT" name="Tether USD" balance="4,200.00" value="$4,200.00" />
        <WalletAsset asset="BTC" name="Bitcoin" balance="0.0214" value="$2,120.42" />
        <WalletAsset asset="ETH" name="Ethereum" balance="0.31" value="$1,100.10" />
        <WalletAsset asset="GOLD" name="Gold" balance="10.2" value="$1,000.00" />
      </Panel>

      <div style={{ height: "20px" }} />

      <Panel title="Connected Wallet">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px",
            background: "#0b0d10",
            border: "1px solid #242a31",
            borderRadius: "9px",
            gap: "15px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "12px", color: "#737c88", marginBottom: "5px" }}>
              Ethereum Wallet
            </div>
            <div style={{ fontSize: "13px", wordBreak: "break-all" }}>
              0x8A34ABCDEF1234567890
            </div>
          </div>
          <button style={secondaryButton}>Copy</button>
        </div>
      </Panel>
    </div>
  );
}

/* ========================= SECURITY ========================= */

function SecurityPage() {
  return (
    <div>
      <PageHeader title="Security" description="Protect your account and connected wallet." />

      <Panel>
        <SettingRow
          title="Two-Factor Authentication"
          description="Add an additional layer of account protection"
          value="Enable →"
        />
        <SettingRow
          title="Active Sessions"
          description="Review devices currently connected to your account"
          value="2 sessions →"
        />
        <SettingRow
          title="Wallet Connections"
          description="Manage authorized wallet connections"
          value=">"
        />
        <SettingRow
          title="Security Notifications"
          description="Get notified about important security events"
          value="On"
          last
        />
      </Panel>
    </div>
  );
}

/* ========================= SETTINGS ========================= */

function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your preferences and platform experience."
      />

      <Panel>
        <SettingRow
          title="General"
          description="Language, currency and timezone"
          value=">"
        />
        <SettingRow
          title="Security"
          description="Password, 2FA and account protection"
          value=">"
        />
        <SettingRow
          title="Notifications"
          description="Manage email and platform notifications"
          value=">"
        />
        <SettingRow
          title="Appearance"
          description="Theme and interface preferences"
          value=">"
        />
        <SettingRow
          title="Preferences"
          description="Customize your platform experience"
          value=">"
          last
        />
      </Panel>

      <div style={{ height: "20px" }} />

      <Panel title="General">
        <SettingsValueRow
          title="Language"
          description="Interface language"
          value="English →"
        />
        <SettingsValueRow
          title="Currency"
          description="Display currency"
          value="USD →"
        />
        <SettingsValueRow
          title="Timezone"
          description="Account timezone"
          value="Asia/Kolkata →"
          last
        />
      </Panel>

      <div style={{ height: "20px" }} />

      <Panel title="Appearance">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "14px" }}>Theme</div>
            <div style={{ marginTop: "4px", fontSize: "12px", color: "#737c88" }}>
              Choose your interface theme
            </div>
          </div>

          <button
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #2a3038",
              background: "#181d23",
              color: "#d9dee5",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Dark
          </button>
        </div>
      </Panel>
    </div>
  );
}

/* ========================= GENERIC ========================= */

function SimplePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Panel>
        <div style={{ color: "#737c88", fontSize: "14px" }}>
          {title} content will appear here.
        </div>
      </Panel>
    </div>
  );
}

function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: 600,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: "7px 0 0",
          color: "#737c88",
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#11151a",
        border: "1px solid #20252c",
        borderRadius: "14px",
        padding: "20px",
      }}
    >
      {title && (
        <div style={{ marginBottom: "18px", fontSize: "14px", fontWeight: 600 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <div
      style={{
        background: "#11151a",
        border: "1px solid #20252c",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <div style={{ fontSize: "11px", color: "#737c88" }}>{label}</div>
      <div style={{ marginTop: "9px", fontSize: "21px", fontWeight: 600 }}>{value}</div>
      {change && (
        <div style={{ marginTop: "6px", fontSize: "11px", color: "#55d98a" }}>
          {change}
        </div>
      )}
    </div>
  );
}

function AssetRow({
  name,
  amount,
  apy,
}: {
  name: string;
  amount: string;
  apy: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid #20252c",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>{name}</div>
        <div style={{ marginTop: "4px", fontSize: "11px", color: "#55d98a" }}>
          {apy}
        </div>
      </div>
      <div style={{ fontSize: "14px" }}>{amount}</div>
    </div>
  );
}

function ActivityRow({
  type,
  asset,
  amount,
  date,
}: {
  type: string;
  asset: string;
  amount: string;
  date: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr 1fr 1fr",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid #20252c",
        fontSize: "13px",
      }}
    >
      <span>{type}</span>
      <span style={{ color: "#aeb6c1" }}>{asset}</span>
      <span>{amount}</span>
      <span style={{ color: "#737c88", textAlign: "right" }}>{date}</span>
    </div>
  );
}

function AccountRow({
  title,
  description,
  status,
  onClick,
  last,
}: {
  title: string;
  description: string;
  status?: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: "78px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        boxSizing: "border-box",
        border: "none",
        borderBottom: last ? "none" : "1px solid #20252c",
        background: "transparent",
        color: "#ffffff",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>{title}</div>
        <div style={{ marginTop: "5px", fontSize: "12px", color: "#737c88" }}>
          {description}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {status && (
          <span
            style={{
              fontSize: "11px",
              color: "#55d98a",
              padding: "4px 8px",
              borderRadius: "6px",
              background: "rgba(85,217,138,0.08)",
            }}
          >
            ✓ {status}
          </span>
        )}
        <span style={{ color: "#626b77", fontSize: "18px" }}>→</span>
      </div>
    </button>
  );
}

function ReferralRow({
  wallet,
  date,
  reward,
}: {
  wallet: string;
  date: string;
  reward: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        padding: "14px 0",
        borderBottom: "1px solid #20252c",
        fontSize: "13px",
      }}
    >
      <span>{wallet}</span>
      <span style={{ color: "#737c88" }}>{date}</span>
      <span style={{ textAlign: "right", color: "#55d98a" }}>+{reward}</span>
    </div>
  );
}

function StakingPosition({
  asset,
  amount,
  apy,
  rewards,
  status,
}: {
  asset: string;
  amount: string;
  apy: string;
  rewards: string;
  status: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
        alignItems: "center",
        gap: "20px",
        padding: "18px 0",
        borderBottom: "1px solid #20252c",
      }}
    >
      <div>
        <div style={{ fontSize: "15px", fontWeight: 600 }}>{asset}</div>
        <div style={{ marginTop: "4px", fontSize: "11px", color: "#737c88" }}>
          Staked
        </div>
      </div>

      <MiniValue value={amount} label="Amount" />
      <MiniValue value={apy} label="APY" green />
      <MiniValue value={rewards} label="Rewards" />

      <div
        style={{
          padding: "5px 8px",
          borderRadius: "6px",
          background: "rgba(85,217,138,0.08)",
          color: "#55d98a",
          fontSize: "10px",
        }}
      >
        {status}
      </div>
    </div>
  );
}

function MiniValue({
  value,
  label,
  green,
}: {
  value: string;
  label: string;
  green?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: "13px", color: green ? "#55d98a" : "#ffffff" }}>
        {value}
      </div>
      <div style={{ marginTop: "4px", fontSize: "11px", color: "#737c88" }}>
        {label}
      </div>
    </div>
  );
}

function WalletAsset({
  asset,
  name,
  balance,
  value,
}: {
  asset: string;
  name: string;
  balance: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid #20252c",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "#1b2027",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          {asset}
        </div>

        <div>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>{asset}</div>
          <div style={{ marginTop: "3px", fontSize: "11px", color: "#737c88" }}>
            {name}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "14px" }}>{balance}</div>
        <div style={{ marginTop: "3px", fontSize: "11px", color: "#737c88" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  value,
  last,
}: {
  title: string;
  description: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "17px 0",
        borderBottom: last ? "none" : "1px solid #20252c",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500 }}>{title}</div>
        <div style={{ marginTop: "4px", fontSize: "12px", color: "#737c88" }}>
          {description}
        </div>
      </div>

      <span style={{ color: "#626b77", fontSize: "13px" }}>{value}</span>
    </div>
  );
}

function SettingsValueRow({
  title,
  description,
  value,
  last,
}: {
  title: string;
  description: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid #20252c",
      }}
    >
      <div>
        <div style={{ fontSize: "14px" }}>{title}</div>
        <div style={{ marginTop: "4px", fontSize: "12px", color: "#737c88" }}>
          {description}
        </div>
      </div>

      <div style={{ fontSize: "13px", color: "#aeb6c1" }}>{value}</div>
    </div>
  );
}

const dropdownButton: React.CSSProperties = {
  width: "100%",
  padding: "10px 7px",
  border: "none",
  background: "transparent",
  color: "#aeb6c1",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "13px",
};
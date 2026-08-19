import React, { useState } from 'react';
import {
  Network,
  Users,
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  Award,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { UserProfile, StoreSettings } from '../../types';

interface FiveTierReferralSystemProps {
  users: UserProfile[];
  storeSettings: StoreSettings;
}

export const FiveTierReferralSystem: React.FC<FiveTierReferralSystemProps> = ({
  users,
  storeSettings,
}) => {
  const currencySymbol = storeSettings.currencySymbol || '৳';

  // 5-generation default override rates
  const [tier1Rate, setTier1Rate] = useState<number>(10); // Direct referrals (Level 1)
  const [tier2Rate, setTier2Rate] = useState<number>(5);  // Level 2
  const [tier3Rate, setTier3Rate] = useState<number>(3);  // Level 3
  const [tier4Rate, setTier4Rate] = useState<number>(2);  // Level 4
  const [tier5Rate, setTier5Rate] = useState<number>(1);  // Level 5

  // Simulation calculator
  const [sampleSalesVolume, setSampleSalesVolume] = useState<number>(50000);
  const [simDirectReferrals, setSimDirectReferrals] = useState<number>(5);
  const [simTeamGrowth, setSimTeamGrowth] = useState<number>(3);

  const resellers = users.filter((u) => u.role === 'reseller');

  // Multi-tier calculations
  const gen1Earn = (sampleSalesVolume * (tier1Rate / 100));
  const gen2Earn = (sampleSalesVolume * (simTeamGrowth) * (tier2Rate / 100));
  const gen3Earn = (sampleSalesVolume * (simTeamGrowth * 2) * (tier3Rate / 100));
  const gen4Earn = (sampleSalesVolume * (simTeamGrowth * 4) * (tier4Rate / 100));
  const gen5Earn = (sampleSalesVolume * (simTeamGrowth * 8) * (tier5Rate / 100));
  const totalSimulatedTeamEarnings = gen1Earn + gen2Earn + gen3Earn + gen4Earn + gen5Earn;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <span>5-Generation Referral & Affiliate Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-tier referral overrides, genealogy network commissions, and team leadership bonuses.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Active Generations: 5 Levels</span>
        </div>
      </div>

      {/* 5-Generation Percentage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {/* Tier 1 */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-bl-full flex items-start justify-end p-2 text-blue-600 font-bold text-xs">
            L1
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Direct Referrals</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{tier1Rate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Generation 1 Override</p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bonus</span>
            <span className="font-semibold text-emerald-600">Immediate</span>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-100 rounded-bl-full flex items-start justify-end p-2 text-slate-600 font-bold text-xs">
            L2
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Sub-Tier Team</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{tier2Rate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Generation 2 Override</p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bonus</span>
            <span className="font-semibold text-slate-700">Team volume</span>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-100 rounded-bl-full flex items-start justify-end p-2 text-slate-600 font-bold text-xs">
            L3
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Network Level 3</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{tier3Rate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Generation 3 Override</p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bonus</span>
            <span className="font-semibold text-slate-700">Team volume</span>
          </div>
        </div>

        {/* Tier 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-100 rounded-bl-full flex items-start justify-end p-2 text-slate-600 font-bold text-xs">
            L4
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Network Level 4</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{tier4Rate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Generation 4 Override</p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bonus</span>
            <span className="font-semibold text-slate-700">Leadership</span>
          </div>
        </div>

        {/* Tier 5 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-100 rounded-bl-full flex items-start justify-end p-2 text-slate-600 font-bold text-xs">
            L5
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Network Level 5</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{tier5Rate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Generation 5 Override</p>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bonus</span>
            <span className="font-semibold text-slate-700">Global pool</span>
          </div>
        </div>
      </div>

      {/* Simulator & Genealogy Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5-Generation Simulator */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Multi-Generation Payout Simulator</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
              Real-time Projection
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">Average Monthly Sales per Reseller:</span>
                <span className="font-bold text-slate-900">{currencySymbol}{sampleSalesVolume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={sampleSalesVolume}
                onChange={(e) => setSampleSalesVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">Direct Recruits (L1)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={simDirectReferrals}
                  onChange={(e) => setSimDirectReferrals(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">Duplication Factor</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={simTeamGrowth}
                  onChange={(e) => setSimTeamGrowth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Simulated Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200/70">
              <div className="flex justify-between text-slate-600">
                <span>Gen 1 ({tier1Rate}% on {simDirectReferrals} sellers):</span>
                <span className="font-semibold text-slate-900">{currencySymbol}{gen1Earn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gen 2 ({tier2Rate}% on sub-teams):</span>
                <span className="font-semibold text-slate-900">{currencySymbol}{gen2Earn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gen 3 ({tier3Rate}% on level 3):</span>
                <span className="font-semibold text-slate-900">{currencySymbol}{gen3Earn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gen 4 ({tier4Rate}% on level 4):</span>
                <span className="font-semibold text-slate-900">{currencySymbol}{gen4Earn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gen 5 ({tier5Rate}% on level 5):</span>
                <span className="font-semibold text-slate-900">{currencySymbol}{gen5Earn.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total 5-Tier Residual Payout:</span>
                <span className="text-blue-600">{currencySymbol}{totalSimulatedTeamEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reseller Genealogy Leaders */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Reseller Referral Leaders</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Network Partners: {resellers.length}</span>
          </div>

          <div className="space-y-3">
            {resellers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No reseller partners registered yet. Once partners register, their 5-level referral tree will appear here.
              </div>
            ) : (
              resellers.slice(0, 5).map((res, idx) => (
                <div key={res.uid} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{res.displayName || res.email}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Code: NEX-{res.uid.slice(0, 6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 block">
                      {res.commissionTier || 'Gold'} Tier
                    </span>
                    <span className="text-[10px] text-slate-400">Direct Team: {idx * 3 + 2}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

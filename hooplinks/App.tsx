
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from './components/Layout';
import { User, UserRole, Game, SkillLevel, Notification, PlayerEntry } from './types';
import { 
  getGames, 
  joinGame, 
  leaveGame, 
  createGame, 
  deleteGame, 
  updateGame, 
  getNotifications, 
  clearNotifications,
  manuallyAddPlayer,
  updatePlayerInGame,
  getUniquePlayers
} from './services/gameService';
import { ICONS } from './constants';
import { cn } from './lib/utils';

// --- Sub-components moved outside of App to ensure stable component types and prevent hook errors ---

const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PLAYER);

  return (
    <div className="max-w-md mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 mt-6 sm:mt-10 animate-fadeIn">
      <h2 className="text-2xl sm:text-3xl font-black mb-8 text-center tracking-tight text-gray-900">Sign In to HoopsLink</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-black text-gray-800 mb-2">Display Name</label>
          <input 
            type="text" 
            className="w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-orange-100 focus:border-orange-600 outline-none transition-all placeholder:text-gray-500 font-bold" 
            placeholder="e.g. Kobe B."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-black text-gray-800 mb-2">Email Address</label>
          <input 
            type="email" 
            className="w-full bg-white text-gray-900 border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-orange-100 focus:border-orange-600 outline-none transition-all placeholder:text-gray-500 font-bold" 
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-black text-gray-800 mb-3">Account Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setRole(UserRole.PLAYER)}
              className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 border-2 ${role === UserRole.PLAYER ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-white text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-400'}`}
            >
              Player
            </button>
            <button 
              onClick={() => setRole(UserRole.ORGANIZER)}
              className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 border-2 ${role === UserRole.ORGANIZER ? 'bg-orange-600 text-white border-orange-600 shadow-lg' : 'bg-white text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-400'}`}
            >
              Organizer
            </button>
          </div>
        </div>
        <button 
          disabled={!name || !email}
          onClick={() => onLogin({ id: Math.random().toString(36).substr(2, 9), name, email, role })}
          className="w-full bg-gray-900 text-white py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-8 shadow-xl py-4"
        >
          Enter the Court
        </button>
      </div>
    </div>
  );
};

const ProfilePage = ({ user, onUpdateProfile }: { user: User | null; onUpdateProfile: (n: string, p: string) => void }) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 mt-6 sm:mt-10 animate-fadeIn">
      <h2 className="text-2xl font-black mb-8 tracking-tight text-gray-900">Profile Settings</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-black text-gray-800 mb-2">Display Name</label>
          <input 
            type="text" 
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-orange-100 focus:border-orange-600 outline-none transition-all font-bold" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-black text-gray-800 mb-2">Phone Number</label>
          <input 
            type="tel" 
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-orange-100 focus:border-orange-600 outline-none transition-all font-bold" 
            placeholder="(555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="mt-2 text-xs text-gray-600 font-medium italic">Shared with organizers when you join a game.</p>
        </div>
        <button 
          onClick={() => onUpdateProfile(name, phone)}
          className="w-full bg-orange-600 text-white py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all transform active:scale-95 shadow-xl shadow-orange-100 py-4"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

const HomePage = ({ 
  user, 
  filteredGames, 
  onNavigate, 
  skillFilter, 
  setSkillFilter, 
  dateFilter, 
  setDateFilter, 
  locationFilter, 
  setLocationFilter 
}: any) => (
  <div className="space-y-8 sm:space-y-12 animate-fadeIn">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">Find your next run.</h1>
        <p className="text-gray-600 font-bold mt-3 text-lg">Browse curated pickup sessions in your area. Reserve your spot, show up, and play.</p>
      </div>
      {user?.role === UserRole.ORGANIZER && (
        <button 
          onClick={() => onNavigate('create')}
          className="flex items-center justify-center space-x-3 bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl shadow-orange-200"
        >
          <ICONS.Plus />
          <span>Host a Game</span>
        </button>
      )}
    </div>

    <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-gray-200 shadow-lg flex flex-col md:flex-row flex-wrap gap-5 items-stretch md:items-center">
      <div className="flex items-center space-x-3 text-orange-600 px-2">
        <ICONS.Filter />
        <span className="text-sm font-black uppercase tracking-[0.2em]">Filters</span>
      </div>
      <div className="flex-1 min-w-[160px]">
        <select 
          className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all cursor-pointer outline-none"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value as SkillLevel | 'All')}
        >
          <option value="All">All Skill Levels</option>
          {Object.values(SkillLevel).map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[160px]">
        <input 
          type="date"
          className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>
      <div className="flex-[2] min-w-[240px]">
        <input 
          type="text"
          placeholder="Court name or city..."
          className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-orange-100 focus:border-orange-600 transition-all outline-none"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>
      {(skillFilter !== 'All' || dateFilter || locationFilter) && (
        <button 
          onClick={() => { setSkillFilter('All'); setDateFilter(''); setLocationFilter(''); }}
          className="text-xs font-black text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-widest text-center px-4"
        >
          Clear All
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredGames.length === 0 ? (
        <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <ICONS.Basketball />
          </div>
          <p className="text-gray-400 font-black text-xl px-4">No matching games found right now.</p>
          <p className="text-gray-400 mt-2 font-medium">Try adjusting your filters or hosting your own run.</p>
        </div>
      ) : (
        filteredGames.map((game: Game) => (
          <div 
            key={game.id} 
            onClick={() => onNavigate('details', game.id)}
            className="group bg-white rounded-[2rem] p-8 border border-gray-200 shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 group-hover:bg-orange-600 transition-colors"></div>
            <div className="flex justify-between items-start mb-6">
              <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                game.skillLevel === SkillLevel.ADVANCED ? 'bg-red-100 text-red-700' : 
                game.skillLevel === SkillLevel.INTERMEDIATE ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {game.skillLevel}
              </span>
              {game.isLocked && <div className="text-red-600 bg-red-50 p-1.5 rounded-lg"><ICONS.Lock /></div>}
            </div>
            <h3 className="text-2xl font-black mb-5 group-hover:text-orange-600 transition-colors leading-tight text-gray-900">{game.title}</h3>
            <div className="space-y-4 text-sm font-bold text-gray-600 mb-8">
              <div className="flex items-center space-x-4 group-hover:text-gray-900 transition-colors">
                <span className="text-orange-500 shrink-0"><ICONS.Calendar /></span>
                <span>{new Date(game.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-4 group-hover:text-gray-900 transition-colors">
                <span className="text-orange-500 shrink-0"><ICONS.Clock /></span>
                <span>{game.time}</span>
              </div>
              <div className="flex items-center space-x-4 group-hover:text-gray-900 transition-colors">
                <span className="text-orange-500 shrink-0"><ICONS.MapPin /></span>
                <span className="truncate">{game.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400 group-hover:text-gray-900 transition-colors"><ICONS.Users /></div>
                <span className="font-black text-gray-900 text-lg">{game.players.filter(p => p.status === 'confirmed').length} / {game.maxPlayers}</span>
              </div>
              <span className={`text-[10px] font-black px-4 py-2 rounded-xl tracking-widest ${
                game.players.filter(p => p.status === 'confirmed').length >= game.maxPlayers ? 'text-orange-700 bg-orange-100' : 'text-green-700 bg-green-100'
              }`}>
                {game.players.filter(p => p.status === 'confirmed').length >= game.maxPlayers ? 'WAITLIST' : 'OPEN RUN'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const RulesPage = () => (
  <div className="max-w-3xl mx-auto space-y-12 animate-fadeIn py-6">
    <div className="text-center space-y-4">
      <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
        <ICONS.Basketball />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">Rules of the Court</h1>
      <p className="text-xl text-gray-600 font-bold">Follow these to keep every run smooth and fun for everyone.</p>
    </div>

    <div className="space-y-8">
      {[
        { title: "Honor Your Reservation", desc: "If you sign up, show up. If you can't make it, cancel at least 2 hours before the run so someone from the waitlist can join." },
        { title: "Call Your Own Fouls", desc: "This is pickup. No refs, no blood, no foul. Be honest, be quick, and keep the ball moving." },
        { title: "Respect the Level", desc: "Check the skill level before joining. If a run is marked Advanced, expect high intensity. If it's Beginner, keep it light and teaching-focused." },
        { title: "The Host has Final Say", desc: "Organizers spend time setting these up. Respect their rules on court usage, ball type, and game length." }
      ].map((rule, idx) => (
        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-6">
            <span className="text-4xl font-black text-orange-200">{idx + 1}</span>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{rule.title}</h3>
              <p className="text-gray-700 font-medium leading-relaxed">{rule.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AboutPage = () => (
  <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-6">
    <div className="relative h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl">
      <img 
        src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        alt="Basketball court"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
        <h1 className="text-5xl font-black text-white tracking-tight leading-tight">Eliminating the chaos <br/> from local runs.</h1>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4">
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-gray-900">Our Story</h2>
        <p className="text-gray-700 text-lg leading-relaxed font-medium">
          HoopsLink was born out of frustration. Too many times we showed up to a court only to find 40 people trying to play on one hoop, or a game with mismatched skill levels that wasn't fun for anyone.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed font-medium">
          We built a simple way to organize: sign up, confirm your spot, and play. No group chats, no "who's coming?", just basketball.
        </p>
      </div>
      <div className="bg-orange-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-orange-200">
        <h2 className="text-3xl font-black mb-6">The Mission</h2>
        <ul className="space-y-6">
          <li className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-lg mt-1"><ICONS.Basketball /></div>
            <p className="font-bold">Organize every local court in the city.</p>
          </li>
          <li className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-lg mt-1"><ICONS.Users /></div>
            <p className="font-bold">Build a community of reliable, respectful ballers.</p>
          </li>
          <li className="flex items-start space-x-4">
            <div className="bg-white/20 p-2 rounded-lg mt-1"><ICONS.Clock /></div>
            <p className="font-bold">Respect everyone's time on and off the court.</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

const GameDetailsPage = ({ 
  game, 
  user, 
  onJoin, 
  onLeave, 
  onToggleLock, 
  onDelete,
  onManuallyAddPlayer,
  onUpdatePlayer,
  onShare
}: any) => {
  const isJoined = user && game.players.some((p: any) => p.userId === user.id);
  const userPlayer = user ? game.players.find((p: any) => p.userId === user.id) : null;
  const isFull = game.players.filter((p: any) => p.status === 'confirmed').length >= game.maxPlayers;
  const isOrganizer = user?.id === game.organizerId;

  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'confirmed' | 'waitlist'>('confirmed');

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onManuallyAddPlayer(game.id, manualName, manualPhone);
    setManualName('');
    setManualPhone('');
    setShowManualAdd(false);
  };

  const startEditing = (p: PlayerEntry) => {
    setEditingPlayerId(p.userId);
    setEditName(p.name);
    setEditStatus(p.status);
  };

  const handleSaveEdit = () => {
    if (editingPlayerId) {
      onUpdatePlayer(game.id, editingPlayerId, { name: editName, status: editStatus });
      setEditingPlayerId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 animate-fadeIn">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-gray-200 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50/50 rounded-bl-full -z-0 translate-x-12 -translate-y-12"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-10 gap-6">
              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">{game.title}</h1>
                <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-black">{game.organizerName[0]}</div>
                   <p className="text-orange-600 font-black uppercase tracking-widest text-xs">Organized by {game.organizerName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onShare(game)}
                  className="p-4 text-orange-600 hover:text-white rounded-2xl bg-orange-50 hover:bg-orange-600 transition-all shadow-md active:scale-95"
                  title="Share game"
                >
                  <ICONS.Share />
                </button>
                {isOrganizer && (
                  <>
                    <button onClick={() => onToggleLock(game.id, game.isLocked)} className="p-4 text-gray-500 hover:text-white rounded-2xl bg-gray-100 hover:bg-orange-600 transition-all shadow-md active:scale-95">
                      {game.isLocked ? <ICONS.Lock /> : <ICONS.Unlock />}
                    </button>
                    <button onClick={() => onDelete(game.id)} className="p-4 text-gray-400 hover:text-white rounded-2xl bg-gray-100 hover:bg-red-600 transition-all shadow-md active:scale-95">
                      <ICONS.Trash />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Date", val: new Date(game.date).toLocaleDateString(), icon: <ICONS.Calendar /> },
                { label: "Time", val: game.time, icon: <ICONS.Clock /> },
                { label: "Level", val: game.skillLevel, icon: <ICONS.Basketball /> },
                { label: "Status", val: game.isLocked ? 'LOCKED' : 'OPEN', icon: <ICONS.Lock />, color: game.isLocked ? 'text-red-600' : 'text-green-600' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-gray-50/80 rounded-3xl border border-gray-100 group hover:bg-white hover:shadow-xl hover:border-orange-200 transition-all">
                  <div className="text-orange-500 mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{item.label}</p>
                  <p className={cn("font-black text-gray-900 group-hover:text-orange-600 transition-colors", item.color)}>{item.val}</p>
                </div>
              ))}
            </div>

            <div className="space-y-10 mb-12">
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center shrink-0 shadow-inner"><ICONS.MapPin /></div>
                <div>
                  <h4 className="font-black text-gray-900 text-xl mb-1">Location</h4>
                  <p className="text-gray-600 font-bold text-lg leading-relaxed">{game.location}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.location)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 font-black uppercase tracking-widest hover:underline mt-4 inline-block flex items-center">
                    View on Google Maps <span className="ml-2">→</span>
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center shrink-0 shadow-inner"><ICONS.Basketball /></div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 text-xl mb-3">Host's Instructions</h4>
                  <div className="bg-gray-50/50 p-8 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors">
                    <p className="text-gray-700 leading-relaxed font-bold text-lg whitespace-pre-wrap">{game.notes || "No special instructions provided for this run."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Registration</p>
                <p className="font-black text-3xl text-gray-900">{game.players.filter((p: any) => p.status === 'confirmed').length} / {game.maxPlayers} <span className="text-gray-400 text-xl">Spots</span></p>
              </div>
              {isJoined ? (
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
                  <div className={`w-full sm:w-auto text-center px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl ${userPlayer?.status === 'confirmed' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
                    {userPlayer?.status === 'confirmed' ? '✓ Registered' : 'On Waitlist'}
                  </div>
                  <button onClick={() => onLeave(game.id, user?.id)} className="text-red-500 font-black uppercase tracking-widest text-xs hover:text-red-700 p-2 transition-colors">Withdraw from Game</button>
                </div>
              ) : (
                <button 
                  disabled={game.isLocked} 
                  onClick={() => onJoin(game.id)} 
                  className={cn(
                    "w-full sm:w-auto px-16 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all transform active:scale-95 shadow-2xl",
                    game.isLocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 hover:-translate-y-1'
                  )}
                >
                  {isFull ? 'Join the Waitlist' : 'Reserve My Spot'}
                </button>
              )}
            </div>
          </div>
        </div>

        {isOrganizer && (
          <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200 shadow-xl border-l-[12px] border-l-orange-600">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Host Controls</h3>
                <p className="text-gray-500 font-bold">Add guests or manage current players.</p>
              </div>
              <button 
                onClick={() => setShowManualAdd(!showManualAdd)}
                className="bg-gray-100 text-gray-800 font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white px-6 py-3 rounded-xl transition-all"
              >
                {showManualAdd ? 'Dismiss' : 'Add Guest'}
              </button>
            </div>
            
            {showManualAdd && (
              <form onSubmit={handleManualAdd} className="space-y-5 animate-fadeIn bg-gray-50 p-6 rounded-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-wider ml-2">Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Guest Player" 
                      className="w-full bg-white border-2 border-gray-200 focus:border-orange-600 rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all"
                      value={manualName}
                      onChange={e => setManualName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-600 uppercase tracking-wider ml-2">Phone</label>
                    <input 
                      type="tel" 
                      placeholder="(Optional)" 
                      className="w-full bg-white border-2 border-gray-200 focus:border-orange-600 rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all"
                      value={manualPhone}
                      onChange={e => setManualPhone(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:bg-black active:scale-[0.98]">Confirm Guest Entry</button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200 shadow-xl lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] flex flex-col">
          <h3 className="text-2xl font-black mb-8 flex items-center space-x-4 text-gray-900 shrink-0">
             <div className="bg-orange-600 text-white p-2 rounded-xl"><ICONS.Users /></div>
             <span>Active Roster</span>
          </h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {game.players.map((p: PlayerEntry, idx: number) => (
              <div key={p.userId} className={cn(
                "group p-5 rounded-2xl transition-all border-2 border-transparent hover:border-orange-100",
                p.status === 'confirmed' ? 'bg-gray-50' : 'bg-gray-100/50 opacity-60'
              )}>
                {editingPlayerId === p.userId ? (
                  <div className="space-y-4 animate-fadeIn">
                    <input 
                      className="w-full bg-white border-2 border-orange-500 rounded-xl px-4 py-3 text-sm font-black outline-none"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <select 
                      className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-sm font-black outline-none"
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as any)}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="waitlist">Waitlist</option>
                    </select>
                    <div className="flex space-x-3">
                      <button onClick={handleSaveEdit} className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black">Save</button>
                      <button onClick={() => setEditingPlayerId(null)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-300">Exit</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center font-black text-gray-400 group-hover:border-orange-200 group-hover:text-orange-500 transition-colors">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block group-hover:text-orange-600 transition-colors">{p.name}</span>
                        {p.phone && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.phone}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOrganizer && (
                        <div className="flex opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 mr-2">
                          <button 
                            onClick={() => startEditing(p)}
                            className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </button>
                          <button 
                            onClick={() => onLeave(game.id, p.userId)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <ICONS.Trash />
                          </button>
                        </div>
                      )}
                      <span className={cn(
                        "text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest",
                        p.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      )}>
                        {p.status === 'confirmed' ? 'CONF' : 'WAIT'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {game.players.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10 font-bold border-2 border-dashed border-gray-100 rounded-3xl">No participants yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Component Fix: PlayerDirectoryPage implementation */
const PlayerDirectoryPage = () => {
  const players = getUniquePlayers();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">Player Directory</h1>
        <p className="text-gray-600 font-bold mt-3 text-lg">Reliable ballers in the community, ranked by activity.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Player</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Games Played</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Last Seen</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.map((p) => (
                <tr key={p.userId} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black">
                        {p.name[0]}
                      </div>
                      <span className="font-black text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-lg font-black text-sm">{p.gamesPlayed}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-gray-600">{new Date(p.lastPlayed).toLocaleDateString()}</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">
                    {p.phone || 'No phone listed'}
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold">No players found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* Component Fix: CreateGamePage implementation */
const CreateGamePage = ({ user, onCreate }: { user: User | null; onCreate: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    maxPlayers: 10,
    skillLevel: SkillLevel.ALL,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onCreate({
      ...formData,
      organizerId: user.id,
      organizerName: user.name,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-[3rem] shadow-2xl border border-gray-100 animate-fadeIn">
      <h2 className="text-3xl font-black mb-8 tracking-tight text-gray-900">Host New Run</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">Game Title</label>
            <input 
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold"
              placeholder="e.g. Saturday Morning Pickup"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Date</label>
              <input 
                required
                type="date"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Time</label>
              <input 
                required
                type="time"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">Location / Court Name</label>
            <input 
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold"
              placeholder="e.g. Central Park Courts"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Max Players</label>
              <input 
                required
                type="number"
                min="2"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold"
                value={formData.maxPlayers}
                onChange={e => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-800 mb-2">Skill Level</label>
              <select 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold cursor-pointer"
                value={formData.skillLevel}
                onChange={e => setFormData({ ...formData, skillLevel: e.target.value as SkillLevel })}
              >
                {Object.values(SkillLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-800 mb-2">Notes & Rules</label>
            <textarea 
              rows={4}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:border-orange-600 outline-none font-bold"
              placeholder="Bring a white/dark jersey, we play to 11..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-xl shadow-orange-100"
        >
          Publish Run
        </button>
      </form>
    </div>
  );
};

/* Component Fix: MyGamesPage implementation */
const MyGamesPage = ({ user, games, notifications, onNavigate, onDismissNotifications }: any) => {
  const myGames = games.filter((g: Game) => g.players.some(p => p.userId === user?.id));

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">Your Court Schedule</h1>
        <p className="text-gray-600 font-bold mt-3 text-lg">Manage your upcoming runs and view notifications from organizers.</p>
      </div>

      {notifications.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-8 shadow-inner">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-orange-900 flex items-center space-x-3">
              <ICONS.Bell />
              <span>Recent Updates</span>
            </h3>
            <button onClick={onDismissNotifications} className="text-xs font-black uppercase tracking-widest text-orange-600 hover:text-orange-900">Dismiss All</button>
          </div>
          <div className="space-y-4">
            {notifications.map((n: Notification) => (
              <div key={n.id} className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm">
                <p className="font-black text-gray-900 mb-1">Update for: {n.gameTitle}</p>
                <p className="text-sm font-bold text-gray-600">{n.reason}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-3">{new Date(n.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-2xl font-black text-gray-900">Registered Runs</h2>
        {myGames.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2.5rem] border border-dashed border-gray-300">
            <p className="text-gray-400 font-black text-lg">You haven't joined any games yet.</p>
            <button onClick={() => onNavigate('home')} className="mt-6 bg-orange-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs">Explore Games</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {myGames.map((game: Game) => (
              <div key={game.id} onClick={() => onNavigate('details', game.id)} className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 hover:border-orange-200 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-black text-gray-900">{game.title}</h3>
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    game.players.find(p => p.userId === user?.id)?.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {game.players.find(p => p.userId === user?.id)?.status === 'confirmed' ? 'Confirmed' : 'Waitlisted'}
                  </span>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-sm font-bold text-gray-600">
                    <ICONS.Calendar />
                    <span>{new Date(game.date).toLocaleDateString()} at {game.time}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm font-bold text-gray-600">
                    <ICONS.MapPin />
                    <span className="truncate">{game.location}</span>
                  </div>
                </div>
                <button className="mt-auto w-full py-4 rounded-xl bg-gray-50 text-gray-900 font-black uppercase tracking-widest text-xs hover:bg-orange-600 hover:text-white transition-all">View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* Component Fix: DashboardPage implementation */
const DashboardPage = ({ games, user, onNavigate, onDelete }: any) => {
  const organizedGames = games.filter((g: Game) => g.organizerId === user?.id);

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">Organizer Dashboard</h1>
          <p className="text-gray-600 font-bold mt-3 text-lg">Manage your hosted runs, track rosters, and cancel games if needed.</p>
        </div>
        <button onClick={() => onNavigate('create')} className="flex items-center justify-center space-x-3 bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-xl shadow-orange-100">
          <ICONS.Plus />
          <span>Host a Game</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {organizedGames.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[2.5rem] border border-dashed border-gray-300">
            <p className="text-gray-400 font-black text-lg">You haven't organized any games yet.</p>
          </div>
        ) : (
          organizedGames.map((game: Game) => (
            <div key={game.id} className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-2xl font-black text-gray-900">{game.title}</h3>
                    {game.isLocked && <div className="text-red-600"><ICONS.Lock /></div>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-gray-600">
                    <div className="flex items-center space-x-2"><ICONS.Calendar /> <span>{new Date(game.date).toLocaleDateString()}</span></div>
                    <div className="flex items-center space-x-2"><ICONS.Clock /> <span>{game.time}</span></div>
                    <div className="flex items-center space-x-2"><ICONS.Users /> <span>{game.players.length} Players</span></div>
                    <div className="flex items-center space-x-2"><ICONS.Basketball /> <span>{game.skillLevel}</span></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 shrink-0">
                  <button onClick={() => onNavigate('details', game.id)} className="px-6 py-4 rounded-xl bg-orange-50 text-orange-600 font-black uppercase tracking-widest text-xs hover:bg-orange-600 hover:text-white transition-all">Manage Roster</button>
                  <button onClick={() => onDelete(game.id)} className="p-4 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"><ICONS.Trash /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hoopslink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [skillFilter, setSkillFilter] = useState<SkillLevel | 'All'>( 'All' );
  const [dateFilter, setDateFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  const refreshGames = useCallback(() => {
    setGames(getGames());
  }, []);

  const refreshNotifications = useCallback(() => {
    if (user) {
      setNotifications(getNotifications(user.id));
    }
  }, [user]);

  useEffect(() => {
    refreshGames();
    refreshNotifications();
    
    // Check for gameId in URL for deep linking
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('gameId');
    if (gameId) {
      navigateTo('details', gameId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshGames, refreshNotifications]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('hoopslink_user', JSON.stringify(u));
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hoopslink_user');
    setCurrentPage('home');
  };

  const navigateTo = (page: string, params?: string) => {
    setCurrentPage(page);
    if (params) setSelectedGameId(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProfile = (name: string, phone: string) => {
    if (!user) return;
    const updatedUser = { ...user, name, phone };
    setUser(updatedUser);
    localStorage.setItem('hoopslink_user', JSON.stringify(updatedUser));
    alert('Profile updated successfully!');
  };

  const handleCreateGame = (gameData: any) => {
    createGame(gameData);
    refreshGames();
    navigateTo('home');
  };

  const handleJoin = (gameId: string) => {
    if (!user) {
      navigateTo('login');
      return;
    }
    joinGame(gameId, user);
    refreshGames();
  };

  const handleLeave = (gameId: string, userId: string) => {
    const isSelf = userId === user?.id;
    if (isSelf) {
      const confirmLeave = window.confirm("Are you sure you want to cancel your spot in this game? This action cannot be undone.");
      if (!confirmLeave) return;
    }
    leaveGame(gameId, userId);
    refreshGames();
  };

  const handleToggleLock = (gameId: string, currentStatus: boolean) => {
    updateGame(gameId, { isLocked: !currentStatus });
    refreshGames();
  };

  const handleDelete = (gameId: string) => {
    const reason = window.prompt('Provide a reason for cancelling this game:', 'Organizers schedule changed');
    if (reason !== null) {
      deleteGame(gameId, reason);
      refreshGames();
      navigateTo('home');
    }
  };

  const handleManuallyAddPlayer = (gameId: string, name: string, phone?: string) => {
    manuallyAddPlayer(gameId, name, phone);
    refreshGames();
  };

  const handleUpdatePlayer = (gameId: string, userId: string, updates: Partial<PlayerEntry>) => {
    updatePlayerInGame(gameId, userId, updates);
    refreshGames();
  };

  const handleDismissNotifications = () => {
    if (user) {
      clearNotifications(user.id);
      refreshNotifications();
    }
  };

  const handleShare = async (game: Game) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?gameId=${game.id}`;
    const shareData = {
      title: `Pickup Game: ${game.title}`,
      text: `Join our pickup game at ${game.location} on ${new Date(game.date).toLocaleDateString()} at ${game.time}!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Game link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link. Please manually copy the URL.');
      }
    }
  };

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchSkill = skillFilter === 'All' || game.skillLevel === skillFilter;
      const matchDate = !dateFilter || game.date === dateFilter;
      const matchLocation = !locationFilter || game.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchSkill && matchDate && matchLocation;
    });
  }, [games, skillFilter, dateFilter, locationFilter]);

  const renderContent = () => {
    switch (currentPage) {
      case 'home': 
        return (
          <HomePage 
            user={user} 
            filteredGames={filteredGames} 
            onNavigate={navigateTo}
            skillFilter={skillFilter}
            setSkillFilter={setSkillFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
          />
        );
      case 'login': return <LoginPage onLogin={handleLogin} />;
      case 'profile': return <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} />;
      case 'player-directory': return <PlayerDirectoryPage />;
      case 'rules': return <RulesPage />;
      case 'about': return <AboutPage />;
      case 'details': 
        const game = games.find(g => g.id === selectedGameId);
        if (!game) return <div className="text-center py-20 text-gray-400 font-bold">Game not found</div>;
        return (
          <GameDetailsPage 
            game={game} 
            user={user} 
            onJoin={handleJoin} 
            onLeave={handleLeave} 
            onToggleLock={handleToggleLock} 
            onDelete={handleDelete} 
            onManuallyAddPlayer={handleManuallyAddPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onShare={handleShare}
          />
        );
      case 'create': return <CreateGamePage user={user} onCreate={handleCreateGame} />;
      case 'my-games': 
        return (
          <MyGamesPage 
            user={user} 
            games={games} 
            notifications={notifications} 
            onNavigate={navigateTo} 
            onDismissNotifications={handleDismissNotifications}
          />
        );
      case 'dashboard': 
        return (
          <DashboardPage 
            games={games} 
            user={user} 
            onNavigate={navigateTo} 
            onDelete={handleDelete} 
          />
        );
      default: return <HomePage user={user} filteredGames={filteredGames} onNavigate={navigateTo} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      onNavigate={navigateTo} 
      currentPage={currentPage}
      hasNotifications={notifications.length > 0}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #EA580C;
        }
      `}</style>
      {renderContent()}
    </Layout>
  );
};

export default App;

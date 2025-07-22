'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  UserGroupIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { LoadingOverlay, LoadingButton } from '@/components/ui/LoadingStates';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorBoundary';
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/Toast';

interface Game {
  id: string;
  name: string;
  description: string;
  type: 'pvp' | 'pve' | 'tournament';
  minPlayers: number;
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  status: 'available' | 'full' | 'starting' | 'in-progress';
  playersOnline: number;
  image: string;
  features: string[];
}

interface Lobby {
  id: string;
  gameId: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  status: 'waiting' | 'starting' | 'full';
  timeLeft: string;
}

const games: Game[] = [
  {
    id: 'hypercatz-battle',
    name: 'Hypercatz Battle Arena',
    description: 'Epic PvP battles with your staked Hypercatz NFTs. Use special abilities and strategic gameplay to dominate opponents.',
    type: 'pvp',
    minPlayers: 2,
    maxPlayers: 8,
    entryFee: 50,
    prizePool: 400,
    duration: '10-15 min',
    difficulty: 'Medium',
    status: 'available',
    playersOnline: 247,
    image: '/games/battle-arena.jpg',
    features: ['Real-time PvP', 'NFT Abilities', 'Ranked Matches', 'Seasonal Rewards']
  },
  {
    id: 'treasure-hunt',
    name: 'Neon Treasure Hunt',
    description: 'Explore cyberpunk dungeons to find rare treasures and $HYPE tokens. Team up or go solo in this adventure.',
    type: 'pve',
    minPlayers: 1,
    maxPlayers: 4,
    entryFee: 25,
    prizePool: 100,
    duration: '20-30 min',
    difficulty: 'Easy',
    status: 'available',
    playersOnline: 156,
    image: '/games/treasure-hunt.jpg',
    features: ['Co-op Mode', 'Procedural Dungeons', 'Rare Loot', 'Boss Battles']
  },
  {
    id: 'hypercatz-racing',
    name: 'Hypercatz Racing Circuit',
    description: 'High-speed racing through neon-lit tracks. Customize your Hypercatz with speed boosts and special abilities.',
    type: 'pvp',
    minPlayers: 2,
    maxPlayers: 12,
    entryFee: 75,
    prizePool: 900,
    duration: '5-8 min',
    difficulty: 'Hard',
    status: 'available',
    playersOnline: 89,
    image: '/games/racing.jpg',
    features: ['Custom Tracks', 'Power-ups', 'Time Trials', 'Championships']
  },
  {
    id: 'grand-tournament',
    name: 'Grand Championship',
    description: 'Weekly tournament featuring the best Hypercatz players. Massive prize pools and exclusive rewards.',
    type: 'tournament',
    minPlayers: 16,
    maxPlayers: 64,
    entryFee: 200,
    prizePool: 12800,
    duration: '2-3 hours',
    difficulty: 'Expert',
    status: 'starting',
    playersOnline: 45,
    image: '/games/tournament.jpg',
    features: ['Elimination Rounds', 'Live Streaming', 'Exclusive NFTs', 'Hall of Fame']
  }
];

const lobbies: Lobby[] = [
  {
    id: 'lobby-1',
    gameId: 'hypercatz-battle',
    name: 'Rookie Arena #1',
    host: 'CyberCat_Pro',
    players: 6,
    maxPlayers: 8,
    entryFee: 50,
    prizePool: 400,
    status: 'waiting',
    timeLeft: '2:34'
  },
  {
    id: 'lobby-2',
    gameId: 'hypercatz-battle',
    name: 'Elite Battle Zone',
    host: 'NeonWarrior',
    players: 4,
    maxPlayers: 8,
    entryFee: 100,
    prizePool: 800,
    status: 'waiting',
    timeLeft: '4:12'
  },
  {
    id: 'lobby-3',
    gameId: 'treasure-hunt',
    name: 'Dungeon Crawlers',
    host: 'TreasureSeeker',
    players: 3,
    maxPlayers: 4,
    entryFee: 25,
    prizePool: 100,
    status: 'waiting',
    timeLeft: '1:45'
  },
  {
    id: 'lobby-4',
    gameId: 'hypercatz-racing',
    name: 'Speed Demons',
    host: 'RacingKing',
    players: 8,
    maxPlayers: 12,
    entryFee: 75,
    prizePool: 900,
    status: 'starting',
    timeLeft: '0:30'
  }
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeTab, setActiveTab] = useState<'games' | 'lobbies'>('games');
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isJoiningLobby, setIsJoiningLobby] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Simulate loading games data
  useEffect(() => {
    const loadGamesData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load games data. Please try again.');
        setIsLoading(false);
      }
    };

    loadGamesData();
  }, []);

  const handleJoinGame = async (game: Game) => {
    try {
      setIsJoiningGame(true);
      setError(null);
      
      // Simulate game joining process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(`Successfully joined ${game.name}!`);
      setSelectedGame(null);
    } catch (err) {
      showError('Failed to join game. Please try again.');
    } finally {
      setIsJoiningGame(false);
    }
  };

  const handleJoinLobby = async (lobby: Lobby) => {
    try {
      setIsJoiningLobby(true);
      setError(null);
      
      // Simulate lobby joining process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess(`Successfully joined ${lobby.name}!`);
      setSelectedLobby(null);
    } catch (err) {
      showError('Failed to join lobby. Please try again.');
    } finally {
      setIsJoiningLobby(false);
    }
  };

  const retryLoadData = () => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-orange-400';
      case 'Expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'full': return 'text-red-400';
      case 'starting': return 'text-yellow-400';
      case 'in-progress': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pvp': return <BoltIcon className="w-5 h-5" />;
      case 'pve': return <StarIcon className="w-5 h-5" />;
      case 'tournament': return <TrophyIcon className="w-5 h-5" />;
      default: return <PlayIcon className="w-5 h-5" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <ErrorDisplay
            error={error}
            onRetry={retryLoadData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative">
        <LoadingOverlay isLoading={isLoading} message="Loading games...">
          <div></div>
        </LoadingOverlay>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Hypercatz Gaming Arena
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Enter the ultimate gaming experience where your NFTs become powerful warriors, racers, and adventurers
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 sm:p-2 border border-cyan-500/20">
            <button
              onClick={() => setActiveTab('games')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2" />
              Games
            </button>
            <button
              onClick={() => setActiveTab('lobbies')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === 'lobbies'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Active </span>Lobbies
            </button>
          </div>
        </div>

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-cyan-500/20 overflow-hidden hover:border-cyan-400/40 transition-all duration-300 group"
              >
                {/* Game Image Placeholder */}
                <div className="h-36 sm:h-40 md:h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-4xl sm:text-5xl md:text-6xl opacity-20">
                      {getTypeIcon(game.type)}
                    </div>
                  </div>
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(game.status)} bg-black/50`}>
                      {game.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-white">
                      {game.playersOnline} online
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight">
                      {game.name}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5">
                        {getTypeIcon(game.type)}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-400 capitalize hidden sm:inline">{game.type}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {game.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-400">Players:</span>
                      <span className="text-white ml-1 sm:ml-2">{game.minPlayers}-{game.maxPlayers}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white ml-1 sm:ml-2">{game.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Entry Fee:</span>
                      <span className="text-cyan-400 ml-1 sm:ml-2">{game.entryFee} $HYPE</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Difficulty:</span>
                      <span className={`ml-1 sm:ml-2 ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-gray-400 text-xs sm:text-sm">Prize Pool</span>
                      <span className="text-yellow-400 font-bold text-sm sm:text-base">{game.prizePool} $HYPE</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-1.5 sm:h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${Math.min((game.prizePool / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {game.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30"
                      >
                        {feature}
                      </span>
                    ))}
                    {game.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                        +{game.features.length - 2} more
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => setSelectedGame(game)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-sm sm:text-base py-2 sm:py-3"
                    disabled={game.status === 'full' || game.status === 'in-progress'}
                  >
                    <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {game.status === 'available' ? 'Play Now' :
                     game.status === 'starting' ? 'Join Game' :
                     game.status === 'full' ? 'Game Full' : 'In Progress'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lobbies Tab */}
        {activeTab === 'lobbies' && (
          <div className="space-y-3 sm:space-y-4">
            {lobbies.map((lobby, index) => (
              <motion.div
                key={lobby.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-cyan-500/20 p-4 sm:p-5 md:p-6 hover:border-cyan-400/40 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{lobby.name}</h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto mt-1 sm:mt-0 ${
                        lobby.status === 'waiting' ? 'bg-green-500/20 text-green-400' :
                        lobby.status === 'starting' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {lobby.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-400">Host:</span>
                        <span className="text-cyan-400 ml-1 sm:ml-2 break-all">{lobby.host}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Players:</span>
                        <span className="text-white ml-1 sm:ml-2">{lobby.players}/{lobby.maxPlayers}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-cyan-400 ml-1 sm:ml-2">{lobby.entryFee} $HYPE</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Prize:</span>
                        <span className="text-yellow-400 ml-1 sm:ml-2">{lobby.prizePool} $HYPE</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end lg:space-x-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-white">{lobby.timeLeft}</div>
                      <div className="text-xs text-gray-400">Time Left</div>
                    </div>
                    
                    <Button
                      onClick={() => setSelectedLobby(lobby)}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                      disabled={lobby.status === 'full' || lobby.status === 'starting'}
                    >
                      {lobby.status === 'waiting' ? 'Join Lobby' :
                       lobby.status === 'starting' ? 'Starting...' : 'Full'}
                    </Button>
                  </div>
                </div>

                {/* Player Progress Bar */}
                <div className="mt-3 sm:mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Players</span>
                    <span>{lobby.players}/{lobby.maxPlayers}</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-purple-400 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(lobby.players / lobby.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Game Selection Modal */}
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-lg sm:rounded-xl border border-cyan-500/30 p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white pr-4">{selectedGame.name}</h2>
                <button
                  onClick={() => setSelectedGame(null)}
                  className="text-gray-400 hover:text-white text-xl sm:text-2xl p-1"
                >
                  ×
                </button>
              </div>

              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{selectedGame.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Game Type:</span>
                    <span className="text-white capitalize">{selectedGame.type}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Players:</span>
                    <span className="text-white">{selectedGame.minPlayers}-{selectedGame.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{selectedGame.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className={getDifficultyColor(selectedGame.difficulty)}>
                      {selectedGame.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Entry Fee:</span>
                    <span className="text-cyan-400">{selectedGame.entryFee} $HYPE</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Prize Pool:</span>
                    <span className="text-yellow-400">{selectedGame.prizePool} $HYPE</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Players Online:</span>
                    <span className="text-green-400">{selectedGame.playersOnline}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-400">Status:</span>
                    <span className={getStatusColor(selectedGame.status)}>
                      {selectedGame.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Game Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                  {selectedGame.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => {
                    setSelectedGame(null);
                    setActiveTab('lobbies');
                  }}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                >
                  <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Find Lobby
                </Button>
                <LoadingButton
                  onClick={() => handleJoinGame(selectedGame)}
                  isLoading={isJoiningGame}
                  loadingText="Joining..."
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-sm sm:text-base py-2 sm:py-3"
                  disabled={selectedGame.status === 'full' || selectedGame.status === 'in-progress'}
                >
                  <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Quick Match
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Lobby Join Modal */}
        {selectedLobby && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedLobby(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-lg sm:rounded-xl border border-cyan-500/30 p-4 sm:p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Join Lobby</h2>
                <button
                  onClick={() => setSelectedLobby(null)}
                  className="text-gray-400 hover:text-white text-xl sm:text-2xl p-1"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400">Lobby Name:</span>
                  <span className="text-white text-right">{selectedLobby.name}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400">Host:</span>
                  <span className="text-cyan-400 text-right break-all">{selectedLobby.host}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white">{selectedLobby.players}/{selectedLobby.maxPlayers}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className="text-cyan-400">{selectedLobby.entryFee} $HYPE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400">Prize Pool:</span>
                  <span className="text-yellow-400">{selectedLobby.prizePool} $HYPE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-400">Time Left:</span>
                  <span className="text-white font-mono">{selectedLobby.timeLeft}</span>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <FireIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm sm:text-base">Entry Fee Required</span>
                </div>
                <p className="text-yellow-300 text-xs sm:text-sm mt-1">
                  {selectedLobby.entryFee} $HYPE will be deducted from your wallet to join this lobby.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => setSelectedLobby(null)}
                  variant="outline"
                  className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                >
                  Cancel
                </Button>
                <LoadingButton
                  onClick={() => handleJoinLobby(selectedLobby)}
                  isLoading={isJoiningLobby}
                  loadingText="Joining..."
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-sm sm:text-base py-2 sm:py-3"
                  disabled={selectedLobby.status === 'full' || selectedLobby.status === 'starting'}
                >
                  <CurrencyDollarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Join for </span>{selectedLobby.entryFee} $HYPE
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
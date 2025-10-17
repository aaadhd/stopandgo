import React, { useState } from 'react';
import type { Teams, Player, TeamColor, DragItem } from './team-setup-types';

// 재사용 가능한 Team Setup 컴포넌트
interface TeamSetupScreenProps {
  teams: Teams;
  onShuffle: () => void;
  onStart: () => void;
  onTeamsChange: (teams: Teams) => void;
  onClose?: () => void; // 모달 닫기 기능 추가
  title?: string; // 커스터마이징 가능한 제목
  maxPlayersPerTeam?: number; // 팀당 최대 플레이어 수
  validationRules?: {
    minTotalPlayers?: number;
    maxTeamDifference?: number;
  };
  teamNames?: {
    blue: string;
    red: string;
  };
  buttonTexts?: {
    shuffle: string;
    start: string;
    close?: string;
  };
}

interface AlertModalProps {
  message: string;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 text-center w-full max-w-sm sm:max-w-md lg:max-w-lg transform transition-all animate-fade-in-up">
        <div className="text-4xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6">⚠️</div>
        <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-display text-primary-text leading-relaxed whitespace-pre-line mb-6 sm:mb-8">
          {message}
        </p>
        
        <button 
          onClick={onClose}
          className="w-full sm:w-auto px-8 sm:px-12 lg:px-16 py-3 sm:py-4 lg:py-5 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-display text-white bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-2xl hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
          OK
        </button>
      </div>
    </div>
  );
};

interface PlayerCardProps {
  player: Player;
  team: TeamColor;
  index: number;
  onDragStart: (dragItem: DragItem) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

interface TeamBoxProps {
  title: string;
  teamColor: string;
  players: Player[];
  team: TeamColor;
  maxPlayersPerTeam: number;
  onDrop: (targetTeam: TeamColor, targetIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (dragItem: DragItem) => void;
  onDragEnd: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  team, 
  index, 
  onDragStart, 
  onDragEnd,
  isDragging = false 
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    onDragStart({ player, sourceTeam: team, sourceIndex: index });
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`flex flex-col items-center cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      }`}
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full bg-white flex justify-center items-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl border-1 sm:border-2 lg:border-3 border-gray-300 shadow-md">
        {player.avatarEmoji}
      </div>
      <span className="mt-1 text-gray-700 font-sans font-bold text-xs sm:text-sm md:text-base text-center px-1 truncate">{player.name}</span>
    </div>
  );
};

const TeamBox: React.FC<TeamBoxProps> = ({ 
  title, 
  teamColor, 
  players, 
  team,
  maxPlayersPerTeam,
  onDrop, 
  onDragOver,
  onDragStart,
  onDragEnd
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 4x2 그리드 위치 계산 (고정)
    const gridWidth = rect.width;
    const gridHeight = rect.height;
    const colWidth = gridWidth / 4;
    const rowHeight = gridHeight / 2;
    
    const col = Math.floor(x / colWidth);
    const row = Math.floor(y / rowHeight);
    const targetIndex = Math.min(row * 4 + col, maxPlayersPerTeam - 1);
    
    onDrop(team, targetIndex);
  };

  return (
    <div 
      className={`bg-white/80 p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-xl text-center border-t-3 lg:border-t-6 border-${teamColor}-400 flex-1`}
      onDrop={handleDrop}
      onDragOver={onDragOver}
    >
      <h3 className={`text-${teamColor}-600 text-lg sm:text-xl md:text-2xl lg:text-3xl font-display mb-2 sm:mb-3 flex items-center justify-center gap-1 sm:gap-2`}>
        {title}
      </h3>
      <div className="grid grid-cols-4 grid-rows-2 gap-1 sm:gap-2 md:gap-3 lg:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-gray-200/50 rounded-lg lg:rounded-xl min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px]">
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            team={team}
            index={index}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({ 
  teams, 
  onShuffle, 
  onStart, 
  onTeamsChange,
  onClose,
  title = "Team Setup",
  maxPlayersPerTeam = 8,
  validationRules = {
    minTotalPlayers: 2,
    maxTeamDifference: 1
  },
  teamNames = {
    blue: "Team A",
    red: "Team B"
  },
  buttonTexts = {
    shuffle: "Shuffle Teams",
    start: "Start Game!",
    close: "Close"
  }
}) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleDragStart = (dragItem: DragItem) => {
    setDraggedItem(dragItem);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleStartGame = () => {
    const teamACount = teams.blue.length;
    const teamBCount = teams.red.length;
    const totalPlayers = teamACount + teamBCount;

    // 총 플레이어가 최소 요구사항 미만인 경우
    if (totalPlayers < (validationRules.minTotalPlayers || 2)) {
      setAlertMessage(`At least ${validationRules.minTotalPlayers || 2} players are required\nto start the game.`);
      return;
    }

    // 팀원 차이가 허용 범위를 초과하는 경우
    const teamDifference = Math.abs(teamACount - teamBCount);
    if (teamDifference > (validationRules.maxTeamDifference || 1)) {
      setAlertMessage(`Team size difference\nmust be ${validationRules.maxTeamDifference || 1} player or less.`);
      return;
    }

    // 유효성 검사 통과 시 게임 시작
    onStart();
  };

  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  const handleDrop = (targetTeam: TeamColor, targetIndex: number) => {
    if (!draggedItem) return;

    const newTeams = { ...teams };
    
    // 소스 팀에서 플레이어 제거
    newTeams[draggedItem.sourceTeam] = newTeams[draggedItem.sourceTeam].filter(
      (_, index) => index !== draggedItem.sourceIndex
    );

    // 타겟 팀에 플레이어 추가
    const playerWithNewTeam = { ...draggedItem.player, team: targetTeam };
    newTeams[targetTeam].splice(targetIndex, 0, playerWithNewTeam);

    // 최대 팀원 수 제한
    if (newTeams[targetTeam].length > maxPlayersPerTeam) {
      newTeams[targetTeam] = newTeams[targetTeam].slice(0, maxPlayersPerTeam);
    }

    onTeamsChange(newTeams);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-2 sm:p-4 pt-8 sm:pt-16 relative overflow-hidden">
      {alertMessage && <AlertModal message={alertMessage} onClose={handleCloseAlert} />}
      
      {/* 헤더 영역 - 반응형으로 개선 */}
      <div className="w-full max-w-6xl mb-4 sm:mb-8 lg:mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-accent-yellow drop-shadow-lg text-center sm:text-left">
            {title}
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-xl font-display text-white bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-xl hover:scale-105 transition-transform whitespace-nowrap"
            >
              {buttonTexts.close}
            </button>
          )}
        </div>
      </div>
      
      {/* 팀 박스 영역 - 항상 가로 배치 유지 */}
      <div className="flex-1 w-full max-w-6xl overflow-y-auto">
        <div className="flex flex-row gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          <TeamBox 
            title={teamNames.blue}
            teamColor="blue" 
            players={teams.blue} 
            team="blue"
            maxPlayersPerTeam={maxPlayersPerTeam}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
          <TeamBox 
            title={teamNames.red}
            teamColor="red" 
            players={teams.red} 
            team="red"
            maxPlayersPerTeam={maxPlayersPerTeam}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
      
      {/* 하단 버튼 영역 - 반응형으로 개선 */}
      <div className="w-full max-w-6xl p-2 sm:p-4 mt-4 sm:mt-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-8">
          <button
            onClick={onShuffle}
            className="flex-1 px-6 py-3 sm:px-8 sm:py-4 lg:px-10 text-xl sm:text-2xl lg:text-3xl font-display text-white bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-2xl hover:scale-105 transition-transform"
          >
            {buttonTexts.shuffle}
          </button>
          <button
            onClick={handleStartGame}
            className="flex-1 px-6 py-3 sm:px-8 sm:py-4 lg:px-10 text-xl sm:text-2xl lg:text-3xl font-display text-white bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl hover:scale-105 transition-transform"
          >
            {buttonTexts.start}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSetupScreen;

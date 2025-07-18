'use client';
import { useEffect, useState, useRef } from "react";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaRandom,
} from "react-icons/fa";
import { BsRepeat } from "react-icons/bs";
import { musicData } from "app/Music/MusicData";
import Image from "next/image";


type Track = typeof musicData[number];

const MusicCard = () => {
  const [tracks] = useState<Track[]>(musicData);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);


  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = tracks[currentTrackIndex];

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    // isPlaying ? audio.pause() : audio.play();
    setIsPlaying(!isPlaying);
  };

  const toggleRepeat = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = !repeat;
    setRepeat(!repeat);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const nextTrack = () => {
    const nextIndex = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    const prevIndex =
      currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => { });
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-lg max-w-sm w-full ">
      <Image
        src="/Img/10-kilo.jpeg"
        alt="Cover"
        className="w-full h-40 object-cover rounded-lg"
        width={400}
        height={200}
      />
      <p className="mt-3 text-lg font-semibold truncate">{currentTrack?.title}</p>
      <p className="text-gray-500 truncate">{currentTrack?.artist}</p>

      <audio
        ref={audioRef}
        src={currentTrack?.audio}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => {
          if (!repeat) nextTrack();
        }}
      />

      {/* Waveform-style bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full my-3 overflow-hidden">
        <div
          className="h-full bg-orange-400 transition-all duration-200 ease-in-out"
          style={{
            width: duration ? `${(currentTime / duration) * 100}%` : "0%",
          }}
        />
      </div>

      {/* Time Reader */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 text-xl text-gray-500 ">
        <FaRandom
          onClick={toggleShuffle}
          className={`cursor-pointer ${shuffle ? "text-orange-500" : ""} hover:text-orange-400`}
        />
        <FaStepBackward
          onClick={prevTrack}
          className="hover:text-orange-400 cursor-pointer"
        />
        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-orange-300 text-black rounded-full flex items-center justify-center"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <FaStepForward
          onClick={nextTrack}
          className="hover:text-orange-400 cursor-pointer"
        />
        <BsRepeat
          onClick={toggleRepeat}
          className={`cursor-pointer ${repeat ? "text-orange-500" : "text-gray-500"} hover:text-orange-500`}
        />
      </div>
    </div>


  );
};

export default MusicCard;

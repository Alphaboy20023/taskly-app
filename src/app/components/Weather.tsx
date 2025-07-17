'use client';
import { useEffect, useState } from 'react';

const Weather = () => {
    const [time, setTime] = useState('');
    const [condition, setCondition] = useState('');

    useEffect(() => {
        const fetchWeather = async () => {
            const res = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=6.5244&longitude=3.3792&current=temperature_2m,weathercode&timezone=auto'
            );
            const data = await res.json();

            const rawTime = data.current.time;
            const parsed = new Date(rawTime);
            const onlyTime = parsed.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });

            setTime(onlyTime);
            setCondition(getWeatherDescription(data.current.weathercode));
        };

        fetchWeather();
    }, []);

    const getWeatherDescription = (code: number) => {
        const codes: Record<number, string> = {
            0: 'Clear Sky',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Normal',
            45: 'Fog',
            48: 'Rime Fog',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Dense Drizzle',
            61: 'Light Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            80: 'Rain Showers',
            95: 'Thunderstorm',
        };
        return codes[code] || 'Unknown';
    };

    return (
        <div className="rounded-lg shadow shadow-lg p-4 font-medium flex items-center bg-gray-100 gap-5 justify-between">
            <p>Weather Today</p>
            <div className='flex flex-col'>
                <p className="text-4xl">{time}</p>
                <p className="text-xl">{condition}</p>
            </div>
        </div>
    );
};

export default Weather;

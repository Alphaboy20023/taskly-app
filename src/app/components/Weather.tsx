"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const API_KEY = 'd0da849ff0de7483a1f636999fe0c9ef';
const CITY = "Lagos";
const COUNTRY = "NG";

const Weather = () => {
    const [time, setTime] = useState("");
    const [condition, setCondition] = useState("");
    const [temp, setTemp] = useState("");
    const [iconUrl, setIconUrl] = useState("");

    const fetchWeather = async () => {
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=metric&appid=${API_KEY}`
            );
            const data = await res.json();

            const now = new Date().toLocaleTimeString("en-NG", {
                timeZone: "Africa/Lagos",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });

            const weather = data.weather?.[0];
            const tempValue = data.main?.temp;

            setTime(now);
            setCondition(weather?.description || "Unavailable");
            setTemp(tempValue !== undefined ? `${Math.round(tempValue)}°C` : "");
            setIconUrl(
                weather?.icon
                    ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
                    : ""
            );
        } catch (err) {
            setTime("N/A");
            setCondition("Failed to fetch weather");
            setTemp("");
            setIconUrl("");
        }
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className=" font-medium flex justify-center">
            <div className="flex items-center gap-4 bg-gray-100 p-6 rounded-lg">
                <div>
                    {iconUrl && (
                        <Image
                            src={iconUrl}
                            alt="weather icon"
                            className="w-12 h-12 object-contain"
                            width={100}
                            height={100}
                        />
                    )}
                    {temp && <p className="text-2xl text-gray-800">{temp}</p>}
                </div>
                <div className="flex flex-col ">
                    <p className="text-4xl">{time}</p>
                    <p className="text-md capitalize">{condition}</p>
                </div>
            </div>
        </div>
    );
};

export default Weather;

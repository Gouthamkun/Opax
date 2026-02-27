/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                darkBg: "#0B0F19",
                cardBg: "#151B28",
                brandBlue: "#3B82F6",
                brandGreen: "#10B981",
                accentCyan: "#06B6D4"
            }
        },
    },
    plugins: [],
}

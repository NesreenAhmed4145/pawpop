import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6 py-12">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                
                <div className="flex justify-center items-center">
                    <div className="w-[340px] h-[260px] sm:w-[420px] sm:h-[320px]  rounded-full flex items-center justify-center relative ">
                        <div className="text-6xl sm:text-7xl select-none animate-bounce">
                            <img src="./paw-logo2.png" alt="" />
                        </div>
                    </div>
                </div>

                {/* القسم الأيمن: النصوص وأزرار التوجيه */}
                <div className="text-left flex flex-col items-start">
                    <span className="text-xs sm:text-sm font-semibold tracking-wider text-[#8C7A6B] uppercase mb-2">
                        Oops, little paw lost
                    </span>
                    
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-[#2C221E] mb-4">
                        404
                    </h1>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2C221E] mb-3">
                        Page Not Found
                    </h2>
                    
                    <p className="text-sm sm:text-base text-[#6B5D54] mb-8 leading-relaxed">
                        We can't find the page you're looking for. It may have moved or the link may be out for a walk.
                    </p>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#9B7B63] hover:bg-[#836752] text-white font-medium px-6 py-3 rounded-full shadow-md transition-all duration-200"
                    >
                        Back to Home →
                    </Link>
                </div>

            </div>
        </div>
    );
}
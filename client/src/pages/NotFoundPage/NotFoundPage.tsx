// import "./NotFoundPage.css";

// const cases = Array.from({ length: 47 }, (_, index) => {
//   const i = index + 1;

//   return {
//     id: i,
//     labelSide: [
//       1, 3, 6, 15, 17, 19, 20, 22, 24, 26, 27, 31, 33, 34, 36, 38, 40, 42, 44,
//       46,
//     ].includes(i)
//       ? "right"
//       : "left",
//     top: -85 + index * 3.25,
//     right: -470 + index * 7,
//   };
// });

// const balls = [
//   { id: 1, left: 0, size: 10, duration: 5, delay: 0.5 },
//   { id: 2, left: 10, size: 5, duration: 4, delay: 0.8 },
//   { id: 3, left: 24, size: 15, duration: 9, delay: 0.65 },
//   { id: 4, left: 34, size: 8, duration: 7, delay: 0.5 },
//   { id: 5, left: 57, size: 14, duration: 7, delay: 0.9 },
//   { id: 6, left: 78, size: 11, duration: 3, delay: 0.3 },
//   { id: 7, left: 91, size: 13, duration: 8, delay: 0.77 },
//   { id: 8, left: 105, size: 7, duration: 6, delay: 0.4 },
//   { id: 9, left: 113, size: 8, duration: 4, delay: 0.6 },
//   { id: 10, left: 120, size: 4, duration: 9, delay: 0.92 },
// ];

// export default function NotFoundPage() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
//       <div className="relative h-[400px] w-[750px] origin-center overflow-hidden bg-[linear-gradient(to_left,#072e61,#004880)] max-[800px]:scale-80 max-[700px]:scale-70 max-[600px]:scale-60 max-[500px]:scale-50 max-[400px]:scale-40 max-[300px]:scale-30">
//         <div className="absolute left-[250px] top-[150px] z-10">
//           <div className="absolute left-0 top-0 h-[60px] w-[500px] skew-y-[-25deg] bg-[#cdfffa]" />
//           <div className="absolute left-[36px] top-[43px] h-[73px] w-[500px] skew-x-[44deg] skew-y-[-25deg] bg-[#7adbd5]" />
//           <div className="absolute left-0 top-[137px] h-[60px] w-[70px] skew-y-[30deg] border border-[rgba(47,127,178,0.5)] bg-[linear-gradient(160deg,#84fff2,#2f7fb2)]" />
//           <div className="absolute left-[70px] top-[42px] h-[60px] w-[500px] skew-y-[-25deg] bg-[linear-gradient(0deg,#0b2f6c,#16598b)]" />

//           <div className="absolute left-[17px] top-[144px] h-[7px] w-[30px] skew-x-[-50deg] skew-y-[30deg] bg-[#5ac8d3]" />
//           <div className="absolute left-[13px] top-[149px] h-[10px] w-[30px] skew-y-[30deg] border border-[rgba(47,127,178,0.5)] bg-[#71e7e4]" />
//           <div className="absolute left-[43px] top-[155px] h-[10px] w-[6px] skew-y-[-30deg] bg-[#287caa]" />

//           {cases.map((item) => (
//             <div
//               key={item.id}
//               className="absolute transition-transform duration-300 ease-in hover:-translate-y-[5px]"
//               style={{ top: `${item.top}px`, right: `${item.right}px` }}
//             >
//               <div className="absolute left-0 top-[3px] h-[55px] w-[70px] skew-y-[25deg] bg-[#9d7f63]" />
//               <div
//                 className="absolute h-[7px] w-[10px] skew-y-[25deg] bg-[#9d7f63]"
//                 style={{
//                   top: item.labelSide === "left" ? "-12px" : "12px",
//                   left: item.labelSide === "left" ? "5px" : "55px",
//                 }}
//               />
//               <div className="absolute left-[2px] top-0 h-[4px] w-[70px] skew-x-[-45deg] skew-y-[25deg] bg-[linear-gradient(to_top,#e9eceb,#a3bab4_50%,#e9eceb)]" />
//               <div className="absolute left-[69px] top-[18px] h-[55px] w-[5px] skew-y-[-25deg] bg-[linear-gradient(to_left,#e9eceb,#a3bab4_50%,#e9eceb)]" />
//               <div className="absolute left-[10px] top-[41px] origin-top-left -rotate-[66deg] skew-y-[-25deg] text-[8px] text-[#7c664e]">
//                 №2428506
//               </div>
//             </div>
//           ))}

//           <div className="absolute">
//             <div className="absolute left-[5px] top-[60px] h-[120px] w-[135px] bg-[linear-gradient(to_top,rgba(132,255,242,1),rgba(132,255,242,1)_30%,rgba(132,255,242,0))] [transform:perspective(120px)_rotateX(-20deg)]" />
//             <div className="absolute left-[7px] top-[-25px] h-[180px] w-[130px] bg-[linear-gradient(to_top,rgba(132,255,242,1),rgba(132,255,242,1)_20%,rgba(132,255,242,0))] [transform:perspective(150px)_rotateX(-20deg)]" />

//             {balls.map((ball) => (
//               <div
//                 key={ball.id}
//                 className="absolute rounded-full bg-[#83fff2] motion-safe:animate-[fadeUp_var(--dur)_infinite]"
//                 style={{
//                   left: `${ball.left}px`,
//                   width: `${ball.size}px`,
//                   height: `${ball.size}px`,
//                   top: 0,
//                   ["--dur" as string]: `${ball.duration}s`,
//                   animationDelay: `${ball.delay}s`,
//                   transform: "translateY(160px)",
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         <div className="absolute right-0 top-0 z-15 h-full w-[150px] bg-[linear-gradient(to_right,rgba(1,20,61,0),rgba(1,20,61,0.8)_65%,rgba(1,20,61,1))]" />

//         <div className="absolute left-[122px] top-0 z-20 flex font-sans text-[200px] font-bold text-white">
//           <div className="mx-[10px] motion-safe:animate-[bounceUpDown_5s_infinite] [animation-delay:.3s]">
//             4
//           </div>
//           <div className="mx-[10px] motion-safe:animate-[bounceUpDown_5.4s_infinite] [animation-delay:.5s]">
//             0
//           </div>
//           <div className="mx-[10px] motion-safe:animate-[bounceUpDown_5s_infinite] [animation-delay:.3s]">
//             4
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-slate-800">
      <div className="wrapper">
        <div className="composition">
          <div className="layer-0 shelf">
            <div className="shelf__side_left"></div>
            <div className="shelf__side_bottom"></div>

            <div className="case case_1">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_2">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_3">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_4">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_5">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_6">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_7">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_8">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_9">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_10">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_11">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_12">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_13">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_14">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_15">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_16">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_17">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_18">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_19">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_20">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_21">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_22">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_23">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_24">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_25">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_26">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_27">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_28">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_29">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_30">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_31">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_32">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_33">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_34">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_35">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_36">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_37">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_38">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_39">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_40">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_41">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_42">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_43">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_44">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_45">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_46">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_right"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>
            <div className="case case_47">
              <div className="case__front"></div>
              <div className="case__top"></div>
              <div className="case__label case__label_left"></div>
              <div className="case__right"></div>
              <div className="case__number">№2428506</div>
            </div>

            <div className="glow">
              <div className="glow__bottom"></div>
              <div className="glow__top"></div>
              <div className="glow__ball glow__ball_1"></div>
              <div className="glow__ball glow__ball_2"></div>
              <div className="glow__ball glow__ball_3"></div>
              <div className="glow__ball glow__ball_4"></div>
              <div className="glow__ball glow__ball_5"></div>
              <div className="glow__ball glow__ball_6"></div>
              <div className="glow__ball glow__ball_7"></div>
              <div className="glow__ball glow__ball_8"></div>
              <div className="glow__ball glow__ball_9"></div>
              <div className="glow__ball glow__ball_10"></div>
            </div>

            <div className="shelf__side_front"></div>
            <div className="shelf__side_right"></div>

            <div className="shelf__handle_top"></div>
            <div className="shelf__handle_front"></div>
            <div className="shelf__handle_right"></div>
          </div>
          <div className="layer-1 shadow"></div>
          <div className="layer-2 numbers">
            <div className="numbers__item numbers__item_1">4</div>
            <div className="numbers__item numbers__item_2">0</div>
            <div className="numbers__item numbers__item_3">4</div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-8 rounded-xl bg-[#004880] px-5 py-3 text-white transition hover:bg-[#072e61] cursor-pointer"
      >
        Назад
      </button>
    </section>
  );
}

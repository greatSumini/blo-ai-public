/**
 * 스타일 가이드 페이지 애니메이션 variants
 */

// Grid Card 진입 애니메이션 (stagger)
export const cardEnterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

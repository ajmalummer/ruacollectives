export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "What is the return policy?",
    answer: "Please refer to our Return & Refund Policy page for complete details.",
  },
  {
    question: "When will I get my order?",
    answer: "Orders are usually delivered within 3 to 10 business days. For more information regarding shipping, please visit our Shipping Policy page.",
  },
  {
    question: "How much does shipping cost?",
    answer: "Shipping charges depend on the courier service selected. India Post costs Rs. 49 across India, while DTDC charges vary based on location and distance. The exact shipping cost will be displayed during checkout.",
  },
];

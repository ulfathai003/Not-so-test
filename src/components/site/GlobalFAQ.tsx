import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    k: "auth",
    q: "Are the degrees from these universities regular or distance?",
    a: "All degrees offered through JoinOnline Education partners are UGC-DEB (University Grants Commission – Distance Education Bureau) approved. They carry equal legal weightage as regular degrees for government jobs, promotions, and higher studies as per 2023 UGC guidelines."
  },
  {
    k: "exam",
    q: "How will the examinations be conducted for online programs?",
    a: "Most programs offer Online Proctored Exams (OPE) from the comfort of your home using a laptop with a webcam. Some distance programs also have designated exam centres across 500+ cities in India including Tier-2 and Tier-3 towns."
  },
  {
    k: "admission",
    q: "What documents are required for PAN-India admissions?",
    a: "You typically need: (1) 10th & 12th Marksheets, (2) Graduation Degree / Provisional Certificate (for MBA/MCA/M.Com), (3) Aadhar Card as ID proof, (4) Passport-size photograph, (5) ABC ID (Academic Bank of Credits). Our counsellors will guide you through the exact list for your chosen university."
  },
  {
    k: "placement",
    q: "Does JoinOnline Education provide placement assistance?",
    a: "Yes. We and our university partners — Jain, Manipal, Amity, NMIMS, LPU — provide dedicated career cells with resume reviews, mock interviews, LinkedIn optimization, and direct referrals to 500+ hiring companies across India. MBA graduates see an average 40% salary hike within 12 months of completion."
  },
  {
    k: "fees",
    q: "Can I pay my fees in installments or EMI?",
    a: "Absolutely. Every university offers semester-wise payment plans so you never pay the full fee upfront. We also assist in zero-cost or low-interest EMI options via our financial partners (Bajaj Finserv, HDFC Credila, etc.) to make higher education truly affordable for every Indian household."
  },
  {
    k: "eligibility",
    q: "Who is eligible for an Online MBA or BBA in India?",
    a: "For Online BBA: Class 12 pass (any stream) with a minimum 50% marks. For Online MBA: Any Bachelor's degree (minimum 50%) from a UGC-recognised university. Working professionals are preferred but freshers are equally eligible. Reserved category candidates (SC/ST/OBC) benefit from relaxed eligibility norms."
  },
  {
    k: "validity",
    q: "Is an online MBA degree valid for government jobs and public sector exams?",
    a: "Yes, as per the UGC's 2020 notification and subsequent 2023 update, online and distance MBA degrees from UGC-DEB approved universities are fully valid for all government jobs, UPSC exams, state PSC exams, bank recruitments and public sector positions. There is no distinction between a regular and an approved online degree."
  },
  {
    k: "duration",
    q: "How long does it take to complete an Online MBA or BBA?",
    a: "An Online MBA is a 2-year (4-semester) program. An Online BBA is a 3-year (6-semester) program. Lateral entry options allow BBA holders to complete MBA in 18 months in some universities. You can also take study breaks (with prior university approval) if life gets busy."
  },
  {
    k: "sikkim",
    q: "Can I complete my 10th or 12th through JoinOnline Education?",
    a: "Yes! Through the Sikkim Board (SBSE – State Board of School Education), we offer government-recognised 10th (Secondary) and 12th (Senior Secondary) programs. Ideal for working adults who missed out on secondary schooling or need to upgrade their qualification. Admissions are open PAN-India."
  },
  {
    k: "schedule",
    q: "What is the class schedule for online degree programs?",
    a: "Live interactive classes are typically held on Saturday and Sunday mornings (9 AM – 1 PM IST) to suit working professionals. All sessions are recorded and available 24/7 on the LMS (Learning Management System). You study at your own pace during the week, and attend live doubt-clearing sessions on weekends."
  },
  {
    k: "universities",
    q: "Which are the best universities for online MBA in India?",
    a: "JoinOnline Education partners with India's most respected UGC-DEB approved online universities: Jain (Deemed-to-be) University (Bengaluru), Manipal University Online, Amity University Online, NMIMS Global Access, Lovely Professional University (LPU), and IGNOU. All are NAAC accredited and their degrees are accepted by employers across India and globally."
  },
  {
    k: "lateral",
    q: "Can I switch universities mid-program or get credit transfer?",
    a: "India's Academic Bank of Credits (ABC), mandatory for all UGC-recognised universities since 2023, allows credit portability. This means credits earned at one university can be transferred to another, giving you flexibility to switch programs or universities without losing academic progress."
  },
  {
    k: "salary",
    q: "What is the average salary after an online MBA in India?",
    a: "Entry-level MBA graduates in Finance, HR, or Marketing earn ₹3.5 – 6 LPA. Experienced professionals with 3–5 years of work experience who complete an online MBA typically see packages of ₹8 – 15 LPA, especially in BFSI, IT, Consulting, and E-commerce sectors. Top performers from premium universities (Jain, NMIMS) average ₹12+ LPA."
  },
  {
    k: "counsellor",
    q: "Is the admissions counselling at JoinOnline Education free?",
    a: "100% free. Our counsellors are salaried employees — not commission agents. They have zero financial incentive to push you toward any specific program or university. We help you choose the right degree for your goals, budget, and career timeline. Call, WhatsApp, or email — no cost, no pressure."
  },
  {
    k: "recognition",
    q: "Are online degrees from India recognised abroad for immigration or foreign jobs?",
    a: "Online degrees from NAAC-accredited, UGC-recognised Indian universities are increasingly accepted abroad. Countries with large Indian diaspora — UAE, USA, Canada, UK, Singapore, Australia — generally recognise these degrees. We recommend checking the specific country's equivalency requirements. For immigration (Canada PR, Australia points test), the degree must be assessed by WES or equivalent. JoinOnline recommends Jain or Manipal University for their best international recognition track record."
  }
];

export interface FAQItem {
  k: string;
  q: string;
  a: string;
}

interface GlobalFAQProps {
  faqs?: FAQItem[];
}

export function GlobalFAQ({ faqs = FAQS }: GlobalFAQProps) {
  return (
    <section className="py-20 bg-[#fbf6e7] border-y-4 border-foreground">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <p className="news-kicker font-black">Help Desk · FAQ</p>
          <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl mt-4">Frequently Asked Questions</h2>
          <div className="news-divider-double mt-6 mx-auto" />
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.k} value={faq.k} className="border-2 border-foreground bg-white px-6 shadow-[4px_4px_0px_0px_#000]">
              <AccordionTrigger className="hover:no-underline py-6">
                <span className="font-headline text-xl text-left">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="font-serif-news text-lg pb-6 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center p-8 border-4 border-dashed border-foreground/20">
          <p className="font-serif-news italic text-xl">
             "JoinOnline Education is committed to bridging the academic gap with technology and transparency."
          </p>
          <p className="news-byline mt-4">— Admissions Oversight Board</p>
        </div>
      </div>
    </section>
  );
}

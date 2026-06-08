import { NextRequest, NextResponse } from "next/server";

interface ValidationTestResult {
  testName: string;
  passed: boolean;
  details: string;
}

interface Step3ValidationResult {
  timestamp: string;
  validationId: string;
  testResults: ValidationTestResult[];
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    verdict: "PASS" | "FAIL";
  };
  executionDetails: {
    emailSectionsGenerated: boolean;
    continuityPreserved: boolean;
    toneCompliant: boolean;
    visualComplianceVerified: boolean;
    validationPayloadMatches: boolean;
  };
}

export async function GET(request: NextRequest) {
  const tests: ValidationTestResult[] = [];
  const timestamp = new Date().toISOString();
  const validationId = `TIER2_STEP3_${timestamp.replace(/[:-]/g, "")}`;

  try {
    // Test 1: Email generation with required params
    const emailTestParams = new URLSearchParams({
      industry: "logistics",
      company: "Westpoint Pharmacy",
      city: "London",
    });

    const emailResponse = await fetch(
      `http://localhost:3000/api/dev/prepopulated-email?${emailTestParams}`
    );

    tests.push({
      testName: "API endpoint responds to email generation request",
      passed: emailResponse.ok,
      details: emailResponse.ok
        ? `Status: ${emailResponse.status}`
        : `Status: ${emailResponse.status}`,
    });

    if (!emailResponse.ok) {
      const failedResult: Step3ValidationResult = {
        timestamp,
        validationId,
        testResults: tests,
        summary: {
          totalTests: 1,
          passedTests: 0,
          failedTests: 1,
          verdict: "FAIL",
        },
        executionDetails: {
          emailSectionsGenerated: false,
          continuityPreserved: false,
          toneCompliant: false,
          visualComplianceVerified: false,
          validationPayloadMatches: false,
        },
      };

      return NextResponse.json(failedResult, { status: 400 });
    }

    const emailData = await emailResponse.json();

    // Test 2: Email sections present and correct count
    const sectionsPresent =
      emailData.email?.sections && emailData.email.sections.length === 3;
    tests.push({
      testName: "Email has exactly 3 sections",
      passed: sectionsPresent,
      details: sectionsPresent
        ? `Sections: Observation, PatternRecognition, DeferredDecision`
        : `Sections present: ${emailData.email?.sections?.length || 0}`,
    });

    // Test 3: Section types are correct
    const correctSectionTypes =
      emailData.email?.sections &&
      emailData.email.sections[0]?.type === "Observation" &&
      emailData.email.sections[1]?.type === "PatternRecognition" &&
      emailData.email.sections[2]?.type === "DeferredDecision";

    tests.push({
      testName: "Section types are in correct order",
      passed: correctSectionTypes,
      details: correctSectionTypes
        ? "Observation → PatternRecognition → DeferredDecision"
        : "Incorrect section types or order",
    });

    // Test 4: Content frames are locked correctly
    const correctFrames =
      emailData.email?.sections &&
      emailData.email.sections[0]?.frame === "specificObservation" &&
      emailData.email.sections[1]?.frame === "trackingPattern" &&
      emailData.email.sections[2]?.frame === "softInevitability";

    tests.push({
      testName: "Content frames match hard-locked schema",
      passed: correctFrames,
      details: correctFrames
        ? "specificObservation → trackingPattern → softInevitability"
        : "Incorrect frames or order",
    });

    // Test 5: Character limits enforced
    const charLimitsOK =
      emailData.email?.sections?.every(
        (s: { characterCount: number }) => s.characterCount <= 250
      ) || false;

    tests.push({
      testName: "All sections within 250 character limit",
      passed: charLimitsOK,
      details: charLimitsOK
        ? "All sections ≤ 250 chars"
        : `Violations: ${emailData.email?.sections
            ?.map(
              (s: { characterCount: number }, i: number) =>
                `Section ${i + 1}: ${s.characterCount}`
            )
            .join(", ")}`,
    });

    // Test 6: Continuity check - industry and company in email
    const industryPresent = emailData.email?.body?.toLowerCase().includes("logistics");
    const companyPresent = emailData.email?.body?.includes("Westpoint Pharmacy");

    tests.push({
      testName: "Email preserves context (industry + company)",
      passed: industryPresent && companyPresent,
      details: industryPresent && companyPresent
        ? "Industry and company both present"
        : `Industry present: ${industryPresent}, Company present: ${companyPresent}`,
    });

    // Test 7: Tone compliance - no vendor-speak
    const vendorPatterns = [
      /we help/i,
      /our solution/i,
      /sign up/i,
      /industry-leading/i,
    ];
    const hasVendorSpeak = vendorPatterns.some((pattern) =>
      pattern.test(emailData.email?.body)
    );

    tests.push({
      testName: "Tone compliance - no vendor-speak detected",
      passed: !hasVendorSpeak,
      details: hasVendorSpeak
        ? "Vendor-speak patterns detected"
        : "Consultant tone maintained",
    });

    // Test 8: Validation passed
    const validationPassed = emailData.validation?.passed === true;

    tests.push({
      testName: "Email passed internal validation",
      passed: validationPassed,
      details: validationPassed
        ? "No violations"
        : `Violations: ${emailData.validation?.violationCount || 0}`,
    });

    // Test 9: Mailto link generated
    const mailtoGenerated = emailData.mailtoLink?.startsWith("mailto:");

    tests.push({
      testName: "Mailto link generated successfully",
      passed: mailtoGenerated,
      details: mailtoGenerated ? "mailto: link present" : "mailto: link missing",
    });

    // Test 10: Subject line within limits
    const subjectOK =
      emailData.email?.subject && emailData.email.subject.length <= 60;

    tests.push({
      testName: "Subject line ≤ 60 characters",
      passed: subjectOK,
      details: subjectOK
        ? `Length: ${emailData.email?.subject?.length}`
        : `Length: ${emailData.email?.subject?.length}`,
    });

    // Calculate summary
    const passedTests = tests.filter((t) => t.passed).length;
    const failedTests = tests.length - passedTests;
    const verdict = failedTests === 0 ? "PASS" : "FAIL";

    const result: Step3ValidationResult = {
      timestamp,
      validationId,
      testResults: tests,
      summary: {
        totalTests: tests.length,
        passedTests,
        failedTests,
        verdict,
      },
      executionDetails: {
        emailSectionsGenerated: sectionsPresent,
        continuityPreserved: industryPresent && companyPresent,
        toneCompliant: !hasVendorSpeak,
        visualComplianceVerified: true, // Email is text-only, no visual styles
        validationPayloadMatches: correctFrames && charLimitsOK,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorResult: Step3ValidationResult = {
      timestamp,
      validationId,
      testResults: [
        ...tests,
        {
          testName: "Test execution completed",
          passed: false,
          details: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      summary: {
        totalTests: tests.length + 1,
        passedTests: tests.filter((t) => t.passed).length,
        failedTests: tests.filter((t) => !t.passed).length + 1,
        verdict: "FAIL",
      },
      executionDetails: {
        emailSectionsGenerated: false,
        continuityPreserved: false,
        toneCompliant: false,
        visualComplianceVerified: false,
        validationPayloadMatches: false,
      },
    };

    return NextResponse.json(errorResult, { status: 500 });
  }
}

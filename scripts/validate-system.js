"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var google_places_1 = require("../lib/google-places");
var question_engine_1 = require("../lib/question-engine");
var proposal_engine_1 = require("../lib/proposal-engine");
function validateSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var searchResults, businesses, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 [Validation] Starting system validation with 10 florist businesses\n');
                    // Search for florist businesses in Manchester
                    console.log('📍 Searching for florist businesses in Manchester...\n');
                    return [4 /*yield*/, (0, google_places_1.searchPlaces)('florist', 'Manchester, UK')];
                case 1:
                    searchResults = _a.sent();
                    if (searchResults.length === 0) {
                        console.log('❌ No businesses found');
                        return [2 /*return*/];
                    }
                    businesses = searchResults.slice(0, 10);
                    console.log("\u2713 Found ".concat(businesses.length, " businesses\n"));
                    _loop_1 = function (i) {
                        var business, details, reviewSnippets, evidence, questions, prioritized, proposal, reviewTexts, themes, lowRatingReviews, highRatingReviews, recentReviews, recentMentionsUrgency, firstQ, reasons;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    business = businesses[i];
                                    console.log("\n".concat('='.repeat(80)));
                                    console.log("#".concat(i + 1, ": ").concat(business.name));
                                    console.log("".concat('='.repeat(80)));
                                    return [4 /*yield*/, (0, google_places_1.getPlaceDetails)(business.place_id)];
                                case 1:
                                    details = _b.sent();
                                    if (!details) {
                                        console.log('⚠ Could not fetch details');
                                        return [2 /*return*/, "continue"];
                                    }
                                    reviewSnippets = (details.reviews || []).map(function (review, idx) { return ({
                                        id: "review_".concat(i, "_").concat(idx),
                                        text: review.text,
                                        source: 'google',
                                        timestamp: new Date(review.time * 1000),
                                        rating: review.rating,
                                        author: review.author_name,
                                    }); });
                                    evidence = {
                                        reviews: reviewSnippets,
                                        facts: [
                                            {
                                                id: "fact_".concat(i, "_1"),
                                                fact: "Located in ".concat(details.formatted_address),
                                                source: 'discovery',
                                                timestamp: new Date(),
                                            },
                                            {
                                                id: "fact_".concat(i, "_2"),
                                                fact: "Rating: ".concat(details.rating, " stars (").concat(details.review_count, " reviews)"),
                                                source: 'google',
                                                timestamp: new Date(),
                                            },
                                        ],
                                        extracted_at: new Date(),
                                        review_count: details.review_count,
                                        rating_average: details.rating,
                                    };
                                    questions = (0, question_engine_1.generateQuestions)(evidence, 'florists');
                                    prioritized = (0, question_engine_1.prioritizeQuestions)(questions);
                                    proposal = (0, proposal_engine_1.generateProposal)(business.name, evidence, prioritized, 'florists');
                                    // ANALYSIS SECTION
                                    console.log('\n📊 WHAT WE LEARNED:');
                                    console.log("  \u2022 ".concat(evidence.review_count, " customer reviews"));
                                    console.log("  \u2022 Average rating: ".concat(evidence.rating_average, " stars"));
                                    reviewTexts = reviewSnippets.map(function (r) { return r.text.toLowerCase(); });
                                    themes = [];
                                    if (reviewTexts.some(function (t) { return t.includes('delivery') || t.includes('courier'); })) {
                                        themes.push('Delivery/logistics mentioned');
                                    }
                                    if (reviewTexts.some(function (t) { return /valentine|mother|easter|christmas/i.test(t); })) {
                                        themes.push('Seasonal peaks detected');
                                    }
                                    if (reviewTexts.some(function (t) { return t.includes('same-day') || t.includes('urgent') || t.includes('emergency'); })) {
                                        themes.push('Emergency/urgent requests detected');
                                    }
                                    if (reviewTexts.some(function (t) { return t.includes('wedding') || t.includes('event'); })) {
                                        themes.push('Event/wedding services detected');
                                    }
                                    if (reviewTexts.some(function (t) { return t.includes('slow') || t.includes('late') || t.includes('delayed'); })) {
                                        themes.push('Delivery delays mentioned');
                                    }
                                    if (reviewTexts.some(function (t) { return t.includes('unreliable'); })) {
                                        themes.push('Courier reliability concerns');
                                    }
                                    themes.forEach(function (theme) { return console.log("  \u2022 ".concat(theme)); });
                                    console.log('\n💡 WHAT SURPRISED US:');
                                    lowRatingReviews = reviewSnippets.filter(function (r) { return r.rating && r.rating <= 3; });
                                    highRatingReviews = reviewSnippets.filter(function (r) { return r.rating && r.rating >= 5; });
                                    if (lowRatingReviews.length > 0 && highRatingReviews.length > 0) {
                                        console.log("  \u2022 Mix of ratings: Despite delivery issues, customers still rate highly");
                                        console.log("    (".concat(lowRatingReviews.length, " low ratings, ").concat(highRatingReviews.length, " high ratings)"));
                                    }
                                    else if (lowRatingReviews.length > 0) {
                                        console.log("  \u2022 Multiple low ratings despite good product quality");
                                    }
                                    else if (highRatingReviews.length === evidence.review_count) {
                                        console.log("  \u2022 All reviews positive - no obvious pain points");
                                    }
                                    recentReviews = reviewSnippets.slice(-3);
                                    recentMentionsUrgency = recentReviews.some(function (r) {
                                        return r.text.toLowerCase().includes('urgent') ||
                                            r.text.toLowerCase().includes('emergency') ||
                                            r.text.toLowerCase().includes('same-day');
                                    });
                                    if (recentMentionsUrgency && !reviewTexts.every(function (t) { return t.includes('urgent'); })) {
                                        console.log("  \u2022 Recent surge in urgent/same-day requests");
                                    }
                                    console.log('\n❓ FIRST QUESTION TO ASK:');
                                    if (prioritized.length > 0) {
                                        firstQ = prioritized[0];
                                        console.log("  \"".concat(firstQ.text, "\""));
                                        console.log("  Why: ".concat(firstQ.relevance));
                                    }
                                    else {
                                        console.log('  [No questions generated - unlikely prospect]');
                                    }
                                    console.log('\n✅ WHY CONTACT THIS BUSINESS:');
                                    reasons = [];
                                    if (reviewSnippets.some(function (r) { return r.text.toLowerCase().includes('delivery'); })) {
                                        reasons.push('Delivery logistics challenges mentioned in reviews');
                                    }
                                    if (reviewSnippets.some(function (r) { return r.text.toLowerCase().includes('late') || r.text.toLowerCase().includes('slow'); })) {
                                        reasons.push('Fulfillment speed is an issue');
                                    }
                                    if (reviewSnippets.some(function (r) { return /valentine|mother|easter|christmas/i.test(r.text); })) {
                                        reasons.push('Handles seasonal peaks - we can support overflow');
                                    }
                                    if (reviewSnippets.some(function (r) { return r.text.toLowerCase().includes('unreliable'); })) {
                                        reasons.push('Current courier unreliable - clear pain point');
                                    }
                                    if (evidence.review_count > 80) {
                                        reasons.push('High volume business - standing orders would be valuable');
                                    }
                                    if (details.rating >= 4.6) {
                                        reasons.push('Quality product - good fit for premium service');
                                    }
                                    if (reasons.length === 0) {
                                        reasons.push('Low priority - few obvious pain points');
                                    }
                                    reasons.forEach(function (reason, idx) { return console.log("  ".concat(idx + 1, ". ").concat(reason)); });
                                    console.log('\n📝 EVIDENCE EXTRACTED:');
                                    console.log("  Reviews: ".concat(reviewSnippets.length));
                                    console.log("  Facts: ".concat(evidence.facts.length));
                                    console.log('\n❓ QUESTIONS GENERATED:');
                                    console.log("  Total: ".concat(questions.length));
                                    prioritized.slice(0, 3).forEach(function (q, idx) {
                                        console.log("  ".concat(idx + 1, ". ").concat(q.text));
                                    });
                                    console.log('\n📧 SAMPLE PROPOSAL OPENING:');
                                    console.log("  Observation: \"".concat(proposal.observation, "\""));
                                    console.log("  How we help: \"".concat(proposal.how_we_help, "\""));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < businesses.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1(i)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("\n".concat('='.repeat(80)));
                    console.log('✅ Validation complete\n');
                    return [2 /*return*/];
            }
        });
    });
}
// Run validation
validateSystem().catch(console.error);

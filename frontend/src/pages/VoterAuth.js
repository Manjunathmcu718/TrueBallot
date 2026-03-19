import React, { useState, useEffect } from "react";
// import { Voter } from "../entities/Voter";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Phone, CheckCircle, Vote, Database } from "lucide-react";
// import { Alert, AlertDescription } from "../components/ui/alert";
// import { AlertCircle } from "lucide-react";



import AuthForm from "../components/voter/AuthForm";
import OTPVerification from "../components/voter/OTPVerification";
import VotingStatus from "../components/voter/VotingStatus";
// import AuthForm from '../components/voter/AuthForm';
// import OTPVerification from '../components/voter/OTPVerification';
// import VotingStatus from '../components/voter/VotingStatus';
import GovernmentVerification from '../components/voter/GovernmentVerification';
import FaceVerification from '../components/voter/FaceVerification';

// In-memory storage for fake voters' voting status
const fakeVoterStorage = {};

// Custom fake data generator (no external library needed)
const generateFakeData = {
  firstName: () => {
    const names = ["Rahul", "Priya", "Amit", "Neha", "Rohan", "Anjali", "Vikram", "Divya", "Arjun", "Sneha", "Karan", "Pooja", "Sanjay", "Ritu", "Arun", "Meera", "Rajesh", "Kavita", "Suresh", "Anita"];
    return names[Math.floor(Math.random() * names.length)];
  },
  lastName: () => {
    const names = ["Kumar", "Sharma", "Singh", "Patel", "Verma", "Gupta", "Rao", "Reddy", "Nair", "Iyer", "Joshi", "Mehta", "Desai", "Shah", "Pillai", "Menon", "Agarwal", "Saxena", "Pandey", "Yadav"];
    return names[Math.floor(Math.random() * names.length)];
  },
  city: () => {
    const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Nagpur", "Patna"];
    return cities[Math.floor(Math.random() * cities.length)];
  },
  street: () => {
    const streets = ["MG Road", "Park Street", "Brigade Road", "Residency Road", "Mall Road", "Station Road", "Main Street", "Gandhi Road", "Nehru Street", "Tagore Avenue"];
    return streets[Math.floor(Math.random() * streets.length)];
  },
  state: () => {
    const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "West Bengal", "Telangana", "Gujarat", "Rajasthan", "UP", "Bihar"];
    return states[Math.floor(Math.random() * states.length)];
  },
  alphanumeric: (length, casing = 'mixed') => {
    const chars = casing === 'upper' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  numeric: (length) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  },
  birthdate: (minAge, maxAge) => {
    const today = new Date();
    const birthYear = today.getFullYear() - minAge - Math.floor(Math.random() * (maxAge - minAge));
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    return new Date(birthYear, birthMonth, birthDay);
  },
  phonePrefix: () => {
    const prefixes = ['9', '8', '7', '6'];
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }
};

export default function VoterAuthPage() {
  const [step, setStep] = useState(1); // 1: Auth, 2: OTP, 3: Status

// import AuthForm from '../components/voter/AuthForm';
// import OTPVerification from '../components/voter/OTPVerification';
// import VotingStatus from '../components/voter/VotingStatus';
// import GovernmentVerification from '../components/voter/GovernmentVerification';
// import FaceVerification from '../components/voter/FaceVerification';

// export default function VoterAuthPage() {
  // const [step, setStep] = useState(1); 
  const [voterIdForOTP, setVoterIdForOTP] = useState(null);
const [otpForTesting, setOtpForTesting] = useState(null);
  const [voterData, setVoterData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [isFakeVoter, setIsFakeVoter] = useState(false);
  const [fakeVoters, setFakeVoters] = useState([]);

  // Generate fake voters on component mount
  useEffect(() => {
    generateFakeVoters();
  }, []);

  const generateFakeVoters = () => {
    const constituencies = ["Delhi South", "Mumbai North", "Bangalore Central", "Chennai West", "Kolkata East", "Hyderabad", "Pune", "Lucknow"];
    const pollingStations = ["Central School", "St. Xavier's School", "City Public School", "Government High School", "Community Hall", "Municipal Office"];
    
    const generatedVoters = [];
    
    // Generate 20 fake voters using custom generator
    for (let i = 0; i < 20; i++) {
      const firstName = generateFakeData.firstName();
      const lastName = generateFakeData.lastName();
      const dateOfBirth = generateFakeData.birthdate(18, 80);
      const age = new Date().getFullYear() - dateOfBirth.getFullYear();
      const buildingNumber = Math.floor(Math.random() * 999) + 1;
      
      generatedVoters.push({
        id: `fake_${i + 1}`,
        voter_id: generateFakeData.alphanumeric(3, 'upper') + generateFakeData.numeric(7),
        aadhar_number: generateFakeData.numeric(12),
        phone_number: generateFakeData.phonePrefix() + generateFakeData.numeric(9),
        full_name: `${firstName} ${lastName}`.toUpperCase(),
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        age: age,
        address: `${buildingNumber} ${generateFakeData.street()}, ${generateFakeData.city()}, ${generateFakeData.state()}`,
        constituency: constituencies[Math.floor(Math.random() * constituencies.length)],
        polling_station: pollingStations[Math.floor(Math.random() * pollingStations.length)],
        has_voted: false,
        voting_timestamp: null,
        otp_code: null,
        otp_expires_at: null
      });
    }
    
    setFakeVoters(generatedVoters);
    
    // Log credentials for testing
    console.log("=== GENERATED FAKE VOTERS (Use these credentials) ===");
    generatedVoters.slice(0, 5).forEach((voter, idx) => {
      console.log(`\n${idx + 1}. ${voter.full_name}`);
      console.log(`   Voter ID: ${voter.voter_id}`);
      console.log(`   Aadhar: ${voter.aadhar_number}`);
      console.log(`   Phone: ${voter.phone_number}`);
    });
    console.log("\n====================================================");
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const generateNewOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // const handleAuthSubmit = async (formData) => {
  //   setIsLoading(true);
  //   setError("");

  //   try {
  //     let voter = null;
  //     let isFromFakeList = false;

  //     // ✅ STEP 1: Check FAKER-GENERATED VOTERS first
  //     const fakeVoter = fakeVoters.find(v => 
  //       v.voter_id === formData.voter_id &&
  //       v.aadhar_number === formData.aadhar_number &&
  //       v.phone_number === formData.phone_number
  //     );

  //     if (fakeVoter) {
  //       // Use fake voter data
  //       voter = { ...fakeVoter };
  //       isFromFakeList = true;
        
  //       // Check if this fake voter has voted (from memory)
  //       if (fakeVoterStorage[voter.id]?.has_voted) {
  //         voter.has_voted = true;
  //         voter.voting_timestamp = fakeVoterStorage[voter.id].voting_timestamp;
  //       }
        
  //       console.log("✅ Authenticated with GENERATED FAKE VOTER:", voter.full_name);
  //     } else {
  //       // ✅ STEP 2: If not in fake list, check DATABASE
  //       const voters = await Voter.filter({
  //         voter_id: formData.voter_id,
  //         aadhar_number: formData.aadhar_number,
  //         phone_number: formData.phone_number
  //       });

  //       if (voters.length === 0) {
  //         setError("Voter not found. Please check your credentials (Voter ID, Aadhar, and Phone must ALL match).");
  //         setIsLoading(false);
  //         return;
  //       }
        
  //       voter = voters[0];
  //       isFromFakeList = false;
  //       console.log("✅ Authenticated with DATABASE:", voter.full_name);
  //     }

  //     // Check age eligibility
  //     const age = calculateAge(voter.date_of_birth);
  //     if (age < 18) {
  //         setError(`Voter is only ${age} years old and is not eligible to vote.`);
  //         setIsLoading(false);
  //         return;
  //     }

  //     // If already voted, go directly to status
  //     if (voter.has_voted) {
  //         setVoterData(voter);
  //         setIsFakeVoter(isFromFakeList);
  //         setStep(3);
  //         setIsLoading(false);
  //         return;
  //     }

  //     // Generate OTP
  //     const otp = generateNewOTP();
  //     const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  //     // Update voter with OTP
  //     if (isFromFakeList) {
  //       // Store in memory for fake voters
  //       voter.otp_code = otp;
  //       voter.otp_expires_at = expiresAt;
  //     } else {
  //       // Update in database for real voters
  //       await Voter.update(voter.id, { 
  //         ...voter,
  //         otp_code: otp, 
  //         otp_expires_at: expiresAt 
  //       });
  //     }
      
  //     setVoterData({ 
  //       ...voter, 
  //       otp_code: otp, 
  //       otp_expires_at: expiresAt 
  //     });
  //     setIsFakeVoter(isFromFakeList);
  //     setStep(2);
  //   } catch (err) {
  //     console.error("Authentication error:", err);
  //     setError("Authentication failed. Please try again.");
  //   }
  //   setIsLoading(false);
  // };

  // const handleOTPVerify = async (enteredOTP) => {
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     if (!voterData) {
  //       setError("No voter data found. Please start authentication again.");
  //       setStep(1);
  //       setIsLoading(false);
  //       return;
  //     }
  //     if (new Date() > new Date(voterData.otp_expires_at)) {
  //       setError("OTP has expired. Please authenticate again.");
  //       setStep(1);
  //       setIsLoading(false);
  //       return;
  //     }
  //     if (enteredOTP !== voterData.otp_code) {
  //       setError("Invalid OTP. Please try again.");
  //       setIsLoading(false);
  //       return;
  //     }
      
  //     // OTP verified successfully
  //     if (isFakeVoter) {
  //       // For fake voters, keep current data
  //       setStep(3);
  //     } else {
  //       // For real voters, re-fetch from database
  //       setVoterData(await Voter.get(voterData.id));
  //       setStep(3);
  //     }
  //   } catch (err) {
  //     console.error("Verification error:", err);
  //     setError("Verification failed. Please try again.");
  //   }
  //   setIsLoading(false);
  // };

  const handleResendOTP = async () => {
    if (!voterData) {
      setError("No voter data to resend OTP to. Please authenticate again.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError("");
    try {
      const newOTP = generateNewOTP();
      const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      
      if (isFakeVoter) {
        // Update in memory for fake voters
        voterData.otp_code = newOTP;
        voterData.otp_expires_at = newExpiresAt;
      // } else {
      //   // Update in database for real voters
      //   await Voter.update(voterData.id, { 
      //     ...voterData,
      //     otp_code: newOTP, 
      //     otp_expires_at: newExpiresAt 
      //   });
      // }
      } else {
  // Backend handles OTP now
}
      
      setVoterData(prev => ({
        ...prev,
        otp_code: newOTP,
        otp_expires_at: newExpiresAt
      }));
      
      setError("New OTP has been generated.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP. Please try again.");
    }
    setIsLoading(false);
  };

  // const handleVoteAction = async () => {
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     if (!voterData || voterData.has_voted) {
  //       setError("Cannot vote. Voter data missing or already voted.");
  //       setIsLoading(false);
  //       return;
  //     }
      
  //     const votingTimestamp = new Date().toISOString();
      
  //     if (isFakeVoter) {
  //       // Store in memory for fake voters
  //       fakeVoterStorage[voterData.id] = {
  //         has_voted: true,
  //         voting_timestamp: votingTimestamp
  //       };
  //       setVoterData(prev => ({
  //         ...prev,
  //         has_voted: true,
  //         voting_timestamp: votingTimestamp
  //       }));
  //     } else {
  //       // Update in database for real voters
  //       const updatedVoter = await Voter.update(voterData.id, {
  //         ...voterData,
  //         has_voted: true,
  //         voting_timestamp: votingTimestamp
  //       });
  //       setVoterData(updatedVoter);
  //     }
  //   } catch (err) {
  //     console.error("Vote action error:", err);
  //     setError("Failed to update voting status. Please try again.");
  //   }
  //   setIsLoading(false);
  // };

  // const [error, setError] = useState('');
  const [formDataForGov, setFormDataForGov] = useState(null);


  const resetFlow = () => {
    setStep(1);
    setVoterData(null);
    setIsFakeVoter(false);
    setError("");
    setIsLoading(false);
  };


  // const progressSteps = [
  //   { id: 1, name: "Authenticate", icon: Shield },
  //   { id: 2, name: "Verify OTP", icon: Phone },
  //   { id: 3, name: "Status", icon: Vote },

  // Step 1: User submits details -> Government verification
  const handleAuthSubmit = (formData) => {
    setFormDataForGov(formData);
    setStep('gov-verify');
  };

  // Step 2: Government verification completes -> Face verification
  const handleGovVerificationComplete = async (report) => {
    if (report.overall_status === 'VERIFIED') {
      setStep('face-verify'); // Go to face verification
    } else {
      setError(`Government ID verification failed. Reason: ${report.overall_status}`);
      setStep(1);
    }
  };

  // Step 3: Face verification completes -> OTP
  const handleFaceVerificationComplete = async (liveImageData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formDataForGov,
          live_image_data: liveImageData
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const baseMsg = data?.error || 'Authentication failed';
        const scoreParts = [];

        if (typeof data?.confidence === 'number') {
          scoreParts.push(`Confidence: ${(data.confidence * 100).toFixed(0)}%`);
        }
        if (data?.detailed_scores) {
          const ds = data.detailed_scores;
          if (ds.face_embedding_score) scoreParts.push(`Embedding: ${ds.face_embedding_score}`);
          if (ds.geometry_score) scoreParts.push(`Geometry: ${ds.geometry_score}`);
          if (ds.anti_spoof_score) scoreParts.push(`Anti-spoof: ${ds.anti_spoof_score}`);
          if (ds.final_confidence) scoreParts.push(`Final: ${ds.final_confidence}`);
        }

        const details = scoreParts.length ? ` (${scoreParts.join(', ')})` : '';
        throw new Error(`${baseMsg}${details}`);
      }

      if (data.status === 'already_voted') {
        setVoterData(data.voter);
        setStep(3);
      } else if (data.status === 'otp_sent') {
        setVoterIdForOTP(data.voter_id);
        setOtpForTesting(data.otp_for_testing);
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
      // Stay on face step so user can retake quickly
      setStep('face-verify');
    }
    setIsLoading(false);
  };

  // Step 4: User verifies OTP
  const handleOTPVerify = async (enteredOTP) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOTP, voter_id: voterIdForOTP }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      if (data.status === 'verified') {
        setVoterData(data.voter);
        setStep(3);
      }
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // Step 5: User casts vote
  const handleVoteAction = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!voterData || !voterData._id) {
        throw new Error('Voter session data is missing. Please start over.');
      }
      const response = await fetch('http://localhost:5000/api/auth/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: voterData._id }),
      });
      const updatedVoter = await response.json();
      if (!response.ok) throw new Error(updatedVoter.error || 'Failed to record vote');
      setVoterData(updatedVoter);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const progressSteps = [
    { id: 1, name: 'Details', icon: Shield },
    { id: 'gov-verify', name: 'Govt. Verify', icon: Database },
    { id: 'face-verify', name: 'Face Verify', icon: Shield },
    { id: 2, name: 'OTP Verify', icon: Phone },
    { id: 3, name: 'Vote Status', icon: Vote },

  ];

  const isStepActive = (stepId) => {
    if (step === 1) return stepId === 1;
    if (step === 'gov-verify') return stepId === 1 || stepId === 'gov-verify';
    if (step === 'face-verify') return stepId === 1 || stepId === 'gov-verify' || stepId === 'face-verify';
    if (step === 2) return stepId === 1 || stepId === 'gov-verify' || stepId === 'face-verify' || stepId === 2;
    if (step === 3) return true;
    return false;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Indian Flag Inspired Header */}
        <header className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-lg border-4 border-white">
            <Shield className="w-8 h-8 text-blue-700" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-3"
          >
            <span className="text-purple-700">Voter</span>{" "}
            <span className="text-blue-600">Authentication</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Secure digital verification for Indian voters. Authenticate your identity and check your voting status.
          </motion.p>
          
          {/* Development Info */}
          {fakeVoters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-xl mx-auto"
            >
               {/* <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>Testing Mode:</strong> {fakeVoters.length} fake voters generated automatically. 
                  <br />Check browser console (F12) for test credentials.
                </AlertDescription>
              </Alert> 
               */}
              {/* <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
  <strong>Testing Mode:</strong> {fakeVoters.length} fake voters generated automatically.
  <br />Check browser console (F12) for test credentials.
</div> */}
            </motion.div>
          )}
        </header>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4">
            {progressSteps.map((item, index) => (
              <React.Fragment key={item.id}>
                {/* <div className="flex flex-col items-center">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${

                   isStepActive(item.id)
                      ? "bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-lg" 
                      : "bg-gray-200 text-gray-500"
                  }`}> */}
                    {/* {item.id < step ? <CheckCircle className="w-6 h-6" /> : <item.icon className="w-6 h-6" />} */}

                    {/* isStepActive(item.id)
                      ? "bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-lg" 
                      : "bg-gray-200 text-gray-500" */}
                  
                    {/* {step === 3 && item.id !== 3 ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <item.icon className="w-6 h-6" />
                    )}

                  </div>  */}
                  <div
 className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
   isStepActive(item.id)
     ? "bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-lg"
     : "bg-gray-200 text-gray-500"
 }`}
>
 {step === 3 && item.id !== 3 ? (
   <CheckCircle className="w-6 h-6" />
 ) : (
   <item.icon className="w-6 h-6" />
 )}
</div>
                  <span className="text-sm text-gray-600 mt-2 hidden sm:block">{item.name}</span>
                {/* </div> */}
               { index < progressSteps.length - 1 && (
                  // <div className={`flex-1 h-1 transition-all duration-300 max-w-24 ${

                  //   item.id < step ? "bg-gradient-to-r from-orange-500 to-green-500" : "bg-gray-200"

                  //   isStepActive(item.id) ? "bg-gradient-to-r from-orange-500 to-green-500" : "bg-gray-200"

                  // }`} />
                  <div
  className={`flex-1 h-1 transition-all duration-300 max-w-24 ${
    isStepActive(item.id)
      ? "bg-gradient-to-r from-orange-500 to-green-500"
      : "bg-gray-200"
  }`}
/>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 max-w-md mx-auto">

              {/* <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert> */}

              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* {step === 1 && <AuthForm key="auth" onSubmit={handleAuthSubmit} isLoading={isLoading} />}
          {step === 2 && (
            <OTPVerification 
              key="otp"  */}

          {step === 1 && (
            <AuthForm 
              key="auth" 
              onSubmit={handleAuthSubmit} 
              isLoading={isLoading} 
            />
          )}

          {step === 'gov-verify' && (
            <GovernmentVerification
              key="gov-verify"
              formData={formDataForGov}
              onComplete={handleGovVerificationComplete}
            />
          )}

          {step === 'face-verify' && (
            <FaceVerification
              key="face-verify"
              onVerify={handleFaceVerificationComplete}
              isLoading={isLoading}
            />
          )}

          {step === 2 && (
            <OTPVerification 
              key="otp" 
              phoneNumber={formDataForGov?.phone_number || '******'}
              otpForTesting={otpForTesting}
              onVerify={handleOTPVerify} 
              onBack={resetFlow}
              isLoading={isLoading} 
            />
          )}

          {step === 3 && (
            <VotingStatus 
              key="status" 

              voterData={voterData} 
              // onVerify={handleOTPVerify} 
              // onBack={() => setStep(1)} 
              // onResendOTP={handleResendOTP}
              onVote={handleVoteAction}
onReset={resetFlow}
              isLoading={isLoading} 
            />
          )}
        
          </AnimatePresence>
      </div>
    </div>
  );
}

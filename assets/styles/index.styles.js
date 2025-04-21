import COLORS from '../../constant/colors'
import Colors from '../../constant/colors'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    header: {
      backgroundColor: Colors.primary,
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerTitle: {
      fontSize: 20,
      color: Colors.white,
      fontWeight: 'bold',
    },
    welcomeContainer: {
      padding: 15,
      backgroundColor: Colors.white,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors.primary,
    },
    scrollContainer: {
      padding: 10,
      paddingBottom: 50,
    },
    cardRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    card: {
      backgroundColor: Colors.primary,
      height: 180,
      borderRadius: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    blackCard: {
      flex: 1,
      backgroundColor: Colors.inputBackground,
    },
    cardContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    cardTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
      color: Colors.white,
    },
    cardCount: {
      fontWeight: 'bold',
      fontSize: 65,
      color: Colors.white,
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 20,
      color: COLORS.textDark,
    },
    collectedItems: {
      backgroundColor: Colors.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: Colors.textSecondary,
      padding: 20,
      marginTop: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    requestTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    requestDetail: {
      fontSize: 15,
      color: Colors.textPrimary,
      fontWeight: '500',
      marginBottom: 4,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 12,
    },
    buttonText: {
      color: Colors.white,
    },
    acceptBtn: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 6,
    },
    declineBtn: {
      backgroundColor: '#F44336',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 6,
    },
    viewLocationBtn: {
      marginTop: 14,
      backgroundColor: Colors.primary,
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: 'center',
    },
    viewLocationText: {
      color: Colors.white,
      fontWeight: 'bold',
      fontSize: 16,
    },
    newsCard: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: 12,
      padding: 15,
      marginTop: 10,
      borderColor: COLORS.border || '#ccc',
      borderWidth: 1,
    },
    newsTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      color: COLORS.textPrimary,
      marginBottom: 4,
    },
    newsSource: {
      fontSize: 13,
      color: COLORS.placeholderText || '#666',
    },
    newsDate: {
      fontSize: 12,
      color: COLORS.placeholderText || '#666',
      marginBottom: 6,
    },
    readMore: {
      color: COLORS.primary,
      fontWeight: 'bold',
      fontSize: 14,
    },
    
  });

  
export default styles;